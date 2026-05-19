package com.gourmetgo.orchestrator.service;

import com.gourmetgo.orchestrator.dto.OrderDto;
import com.gourmetgo.orchestrator.dto.SagaResponse;
import com.gourmetgo.proto.accounting.*;
import com.gourmetgo.proto.kitchen.*;
import com.gourmetgo.proto.order.*;
import io.grpc.StatusRuntimeException;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

@Service
public class OrderSagaService {

    // ── gRPC stubs — net.devh creates and manages the channels ───────────────
    // The name in @GrpcClient must match a key under grpc.client.* in application.yml

    @GrpcClient("order-service")
    private OrderServiceGrpc.OrderServiceBlockingStub orderStub;

    @GrpcClient("kitchen-service")
    private KitchenServiceGrpc.KitchenServiceBlockingStub kitchenStub;

    @GrpcClient("accounting-service")
    private AccountingServiceGrpc.AccountingServiceBlockingStub accountingStub;

    // ── Saga entry point ──────────────────────────────────────────────────────

    /**
     * Runs the Create-Order saga end-to-end.
     *
     * Step 0 creates the order in order-service (no pre-existing order required).
     * Happy path  : ticket created + payment authorized → APPROVED
     * Failure path: any step fails → compensate → REJECTED
     */
    public SagaResponse runSaga(String customerId, double amount, String deliveryAddress) {

        String ticketId = null;
        String orderId  = null;

        try {
            // ── Step 0: Create the order ──────────────────────────────────────
            OrderResponse created = orderStub.createOrder(CreateOrderRequest.newBuilder()
                    .setCustomerId(customerId)
                    .setDeliveryAddress(deliveryAddress)
                    .addItems(OrderItem.newBuilder()
                            .setMenuItemId("item-1")
                            .setName("Order")
                            .setQuantity(1)
                            .setUnitPrice(amount)
                            .build())
                    .build());
            orderId = created.getOrderId();

            // ── Step 1: Mark order APPROVAL_PENDING ───────────────────────────
            orderStub.updateOrderStatus(UpdateOrderStatusRequest.newBuilder()
                    .setOrderId(orderId)
                    .setStatus(OrderStatus.APPROVAL_PENDING)
                    .build());

            // ── Step 2: Create kitchen ticket ─────────────────────────────────
            // A StatusRuntimeException here means the kitchen service is down or
            // the orderId is invalid — either way we compensate.
            TicketResponse ticketResponse = kitchenStub.createTicket(
                    CreateTicketRequest.newBuilder()
                            .setOrderId(orderId)
                            .build());
            ticketId = ticketResponse.getTicketId();

            // ── Step 3: Authorize payment ─────────────────────────────────────
            PaymentResponse paymentResponse = accountingStub.authorizePayment(
                    AuthorizePaymentRequest.newBuilder()
                            .setOrderId(orderId)
                            .setCustomerId(customerId)
                            .setAmount(amount)
                            .build());

            if (paymentResponse.getStatus() != PaymentStatus.AUTHORIZED) {
                // Payment declined → compensate and reject
                compensate(orderId, ticketId);
                return new SagaResponse(orderId, "REJECTED",
                        "Payment declined — amount must be less than 100");
            }

            // ── Step 4: Happy path — confirm everything ───────────────────────
            accountingStub.confirmPayment(ConfirmPaymentRequest.newBuilder()
                    .setAuthorizationId(paymentResponse.getAuthorizationId())
                    .build());

            kitchenStub.confirmTicket(ConfirmTicketRequest.newBuilder()
                    .setTicketId(ticketId)
                    .build());

            orderStub.updateOrderStatus(UpdateOrderStatusRequest.newBuilder()
                    .setOrderId(orderId)
                    .setStatus(OrderStatus.APPROVED)
                    .build());

            return new SagaResponse(orderId, "APPROVED", "Order approved and kitchen notified");

        } catch (StatusRuntimeException e) {
            // Network failure or downstream error — compensate what succeeded so far
            compensate(orderId, ticketId);
            return new SagaResponse(orderId, "REJECTED",
                    "Service error: " + e.getStatus().getDescription());
        }
    }

    // ── Read-only helper for the GET endpoint ─────────────────────────────────

    public OrderDto getOrder(String orderId) {
        OrderResponse response = orderStub.getOrder(
                GetOrderRequest.newBuilder().setOrderId(orderId).build());

        return new OrderDto(
                response.getOrderId(),
                response.getCustomerId(),
                response.getStatus().name(),
                response.getTotalAmount());
    }

    // ── Compensation ──────────────────────────────────────────────────────────

    /**
     * Best-effort undo. Each step is wrapped in its own try/catch so that a
     * failure in one compensation step does not prevent the others from running.
     */
    private void compensate(String orderId, String ticketId) {
        if (ticketId != null) {
            try {
                kitchenStub.rejectTicket(RejectRequest.newBuilder()
                        .setTicketId(ticketId)
                        .setReason("Saga compensation — order rejected")
                        .build());
            } catch (StatusRuntimeException ignored) {
            }
        }

        if (orderId != null) {
            try {
                orderStub.updateOrderStatus(UpdateOrderStatusRequest.newBuilder()
                        .setOrderId(orderId)
                        .setStatus(OrderStatus.REJECTED)
                        .build());
            } catch (StatusRuntimeException ignored) {
            }
        }
    }
}

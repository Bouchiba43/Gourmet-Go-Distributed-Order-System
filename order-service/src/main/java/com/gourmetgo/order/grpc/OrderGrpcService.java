package com.gourmetgo.order.grpc;

import com.gourmetgo.order.domain.Order;
import com.gourmetgo.order.repository.OrderRepository;
import com.gourmetgo.proto.order.*;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.UUID;

@GrpcService
public class OrderGrpcService extends OrderServiceGrpc.OrderServiceImplBase {

    private final OrderRepository orderRepository;

    @Autowired
    public OrderGrpcService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public void createOrder(CreateOrderRequest request, StreamObserver<OrderResponse> responseObserver) {
        double total = request.getItemsList().stream()
                .mapToDouble(item -> item.getUnitPrice() * item.getQuantity())
                .sum();

        Order order = new Order(
                UUID.randomUUID().toString(),
                request.getCustomerId(),
                OrderStatus.PENDING.name(),
                total,
                request.getDeliveryAddress(),
                LocalDateTime.now()
        );

        orderRepository.save(order);

        responseObserver.onNext(toResponse(order));
        responseObserver.onCompleted();
    }

    @Override
    public void getOrder(GetOrderRequest request, StreamObserver<OrderResponse> responseObserver) {
        orderRepository.findById(request.getOrderId()).ifPresentOrElse(
                order -> {
                    responseObserver.onNext(toResponse(order));
                    responseObserver.onCompleted();
                },
                () -> responseObserver.onError(
                        Status.NOT_FOUND
                                .withDescription("Order not found: " + request.getOrderId())
                                .asRuntimeException()
                )
        );
    }

    @Override
    public void updateOrderStatus(UpdateOrderStatusRequest request, StreamObserver<OrderResponse> responseObserver) {
        orderRepository.findById(request.getOrderId()).ifPresentOrElse(
                order -> {
                    order.setStatus(request.getStatus().name());
                    orderRepository.save(order);
                    responseObserver.onNext(toResponse(order));
                    responseObserver.onCompleted();
                },
                () -> responseObserver.onError(
                        Status.NOT_FOUND
                                .withDescription("Order not found: " + request.getOrderId())
                                .asRuntimeException()
                )
        );
    }

    @Override
    public void cancelOrder(CancelOrderRequest request, StreamObserver<OrderResponse> responseObserver) {
        orderRepository.findById(request.getOrderId()).ifPresentOrElse(
                order -> {
                    order.setStatus(OrderStatus.CANCELLED.name());
                    orderRepository.save(order);
                    responseObserver.onNext(toResponse(order));
                    responseObserver.onCompleted();
                },
                () -> responseObserver.onError(
                        Status.NOT_FOUND
                                .withDescription("Order not found: " + request.getOrderId())
                                .asRuntimeException()
                )
        );
    }

    private OrderResponse toResponse(Order order) {
        return OrderResponse.newBuilder()
                .setOrderId(order.getId())
                .setCustomerId(order.getCustomerId())
                .setStatus(OrderStatus.valueOf(order.getStatus()))
                .setTotalAmount(order.getAmount())
                .build();
    }
}

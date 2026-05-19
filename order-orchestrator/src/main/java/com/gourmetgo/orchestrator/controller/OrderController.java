package com.gourmetgo.orchestrator.controller;

import com.gourmetgo.orchestrator.dto.CreateOrderSagaRequest;
import com.gourmetgo.orchestrator.dto.OrderDto;
import com.gourmetgo.orchestrator.dto.SagaResponse;
import com.gourmetgo.orchestrator.service.OrderSagaService;
import io.grpc.StatusRuntimeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderSagaService sagaService;

    @Autowired
    public OrderController(OrderSagaService sagaService) {
        this.sagaService = sagaService;
    }

    /**
     * POST /api/orders
     * Body: { "customerId": "...", "amount": 49.99, "deliveryAddress": "..." }
     *
     * Creates the order and runs the full saga. Returns 200 APPROVED or 422 REJECTED.
     */
    @PostMapping
    public ResponseEntity<SagaResponse> executeSaga(@RequestBody CreateOrderSagaRequest request) {
        SagaResponse response = sagaService.runSaga(
                request.getCustomerId(), request.getAmount(), request.getDeliveryAddress());

        HttpStatus status = "APPROVED".equals(response.getStatus())
                ? HttpStatus.OK
                : HttpStatus.UNPROCESSABLE_ENTITY;

        return ResponseEntity.status(status).body(response);
    }

    /**
     * GET /api/orders/{orderId}
     * Delegates to order-service via gRPC and returns the current order state.
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDto> getOrder(@PathVariable("orderId") String orderId) {
        try {
            OrderDto order = sagaService.getOrder(orderId);
            return ResponseEntity.ok(order);
        } catch (StatusRuntimeException e) {
            // order-service returned NOT_FOUND or is unreachable
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}

package com.gourmetgo.orchestrator.dto;

public class SagaResponse {

    private String orderId;
    private String status;   // "APPROVED" or "REJECTED"
    private String message;

    public SagaResponse(String orderId, String status, String message) {
        this.orderId = orderId;
        this.status  = status;
        this.message = message;
    }

    public String getOrderId() { return orderId; }
    public String getStatus()  { return status; }
    public String getMessage() { return message; }
}

package com.gourmetgo.orchestrator.dto;

public class OrderDto {

    private String orderId;
    private String customerId;
    private String status;
    private double totalAmount;

    public OrderDto(String orderId, String customerId, String status, double totalAmount) {
        this.orderId     = orderId;
        this.customerId  = customerId;
        this.status      = status;
        this.totalAmount = totalAmount;
    }

    public String getOrderId()     { return orderId; }
    public String getCustomerId()  { return customerId; }
    public String getStatus()      { return status; }
    public double getTotalAmount() { return totalAmount; }
}

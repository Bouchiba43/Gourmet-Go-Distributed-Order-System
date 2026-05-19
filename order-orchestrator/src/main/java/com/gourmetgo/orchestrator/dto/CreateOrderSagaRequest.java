package com.gourmetgo.orchestrator.dto;

public class CreateOrderSagaRequest {

    private String orderId;
    private double amount;

    public String getOrderId() { return orderId; }
    public double  getAmount()  { return amount; }

    public void setOrderId(String orderId) { this.orderId = orderId; }
    public void setAmount(double amount)   { this.amount  = amount; }
}

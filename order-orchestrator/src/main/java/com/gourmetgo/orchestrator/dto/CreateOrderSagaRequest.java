package com.gourmetgo.orchestrator.dto;

public class CreateOrderSagaRequest {

    private String customerId;
    private double amount;
    private String deliveryAddress;

    public String getCustomerId()       { return customerId; }
    public double getAmount()           { return amount; }
    public String getDeliveryAddress()  { return deliveryAddress; }

    public void setCustomerId(String customerId)             { this.customerId = customerId; }
    public void setAmount(double amount)                     { this.amount = amount; }
    public void setDeliveryAddress(String deliveryAddress)   { this.deliveryAddress = deliveryAddress; }
}

package com.gourmetgo.accounting.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "payment_records")
public class PaymentRecord {

    @Id
    private String id; // serves as authorization_id

    @Column(nullable = false)
    private String orderId;

    private String customerId;

    @Column(nullable = false)
    private double amount;

    private String paymentMethodId;

    @Column(nullable = false)
    private boolean authorized;

    // PENDING | AUTHORIZED | CONFIRMED | REVERSED | FAILED
    @Column(nullable = false)
    private String status;

    public PaymentRecord() {}

    public PaymentRecord(String id, String orderId, String customerId, double amount,
                         String paymentMethodId, boolean authorized, String status) {
        this.id = id;
        this.orderId = orderId;
        this.customerId = customerId;
        this.amount = amount;
        this.paymentMethodId = paymentMethodId;
        this.authorized = authorized;
        this.status = status;
    }

    public String getId()              { return id; }
    public String getOrderId()         { return orderId; }
    public String getCustomerId()      { return customerId; }
    public double getAmount()          { return amount; }
    public String getPaymentMethodId() { return paymentMethodId; }
    public boolean isAuthorized()      { return authorized; }
    public String getStatus()          { return status; }

    public void setId(String id)                          { this.id = id; }
    public void setOrderId(String orderId)                { this.orderId = orderId; }
    public void setCustomerId(String customerId)          { this.customerId = customerId; }
    public void setAmount(double amount)                  { this.amount = amount; }
    public void setPaymentMethodId(String paymentMethodId){ this.paymentMethodId = paymentMethodId; }
    public void setAuthorized(boolean authorized)         { this.authorized = authorized; }
    public void setStatus(String status)                  { this.status = status; }
}

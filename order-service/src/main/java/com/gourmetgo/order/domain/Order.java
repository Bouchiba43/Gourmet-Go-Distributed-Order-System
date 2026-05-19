package com.gourmetgo.order.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    private String id;

    @Column(nullable = false)
    private String customerId;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private double amount;

    private String deliveryAddress;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Order() {}

    public Order(String id, String customerId, String status, double amount,
                 String deliveryAddress, LocalDateTime createdAt) {
        this.id = id;
        this.customerId = customerId;
        this.status = status;
        this.amount = amount;
        this.deliveryAddress = deliveryAddress;
        this.createdAt = createdAt;
    }

    public String getId()                  { return id; }
    public String getCustomerId()          { return customerId; }
    public String getStatus()              { return status; }
    public double getAmount()              { return amount; }
    public String getDeliveryAddress()     { return deliveryAddress; }
    public LocalDateTime getCreatedAt()    { return createdAt; }

    public void setId(String id)                          { this.id = id; }
    public void setCustomerId(String customerId)          { this.customerId = customerId; }
    public void setStatus(String status)                  { this.status = status; }
    public void setAmount(double amount)                  { this.amount = amount; }
    public void setDeliveryAddress(String deliveryAddress){ this.deliveryAddress = deliveryAddress; }
    public void setCreatedAt(LocalDateTime createdAt)     { this.createdAt = createdAt; }
}

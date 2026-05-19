package com.gourmetgo.kitchen.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    private String id;

    @Column(nullable = false)
    private String orderId;

    // AWAITING_ACCEPTANCE | ACCEPTED | PREPARING | READY_FOR_PICKUP | PICKED_UP | CANCELLED | REJECTED
    @Column(nullable = false)
    private String status;

    public Ticket() {}

    public Ticket(String id, String orderId, String status) {
        this.id = id;
        this.orderId = orderId;
        this.status = status;
    }

    public String getId()      { return id; }
    public String getOrderId() { return orderId; }
    public String getStatus()  { return status; }

    public void setId(String id)           { this.id = id; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public void setStatus(String status)   { this.status = status; }
}

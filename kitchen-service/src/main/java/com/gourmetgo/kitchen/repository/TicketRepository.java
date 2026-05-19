package com.gourmetgo.kitchen.repository;

import com.gourmetgo.kitchen.domain.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, String> {
    Optional<Ticket> findByOrderId(String orderId);
}

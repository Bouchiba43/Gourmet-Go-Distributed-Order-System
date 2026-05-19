package com.gourmetgo.accounting.repository;

import com.gourmetgo.accounting.domain.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, String> {
}

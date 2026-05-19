package com.gourmetgo.accounting.grpc;

import com.gourmetgo.accounting.domain.PaymentRecord;
import com.gourmetgo.accounting.repository.PaymentRecordRepository;
import com.gourmetgo.proto.accounting.*;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.UUID;

@GrpcService
public class AccountingGrpcService extends AccountingServiceGrpc.AccountingServiceImplBase {

    private final PaymentRecordRepository paymentRecordRepository;

    @Autowired
    public AccountingGrpcService(PaymentRecordRepository paymentRecordRepository) {
        this.paymentRecordRepository = paymentRecordRepository;
    }

    @Override
    public void authorizePayment(AuthorizePaymentRequest request, StreamObserver<PaymentResponse> responseObserver) {
        // Business rule: authorized only when amount < 100
        boolean authorized = request.getAmount() < 100.0;

        PaymentRecord record = new PaymentRecord(
                UUID.randomUUID().toString(),
                request.getOrderId(),
                request.getCustomerId(),
                request.getAmount(),
                request.getPaymentMethodId(),
                authorized,
                authorized ? PaymentStatus.AUTHORIZED.name() : PaymentStatus.FAILED.name()
        );

        paymentRecordRepository.save(record);

        responseObserver.onNext(PaymentResponse.newBuilder()
                .setAuthorizationId(record.getId())
                .setStatus(authorized ? PaymentStatus.AUTHORIZED : PaymentStatus.FAILED)
                .setMessage(authorized ? "Payment authorized" : "Payment declined: amount exceeds limit")
                .build());
        responseObserver.onCompleted();
    }

    @Override
    public void confirmPayment(ConfirmPaymentRequest request, StreamObserver<PaymentResponse> responseObserver) {
        paymentRecordRepository.findById(request.getAuthorizationId()).ifPresentOrElse(
                record -> {
                    if (!record.isAuthorized()) {
                        responseObserver.onError(
                                Status.FAILED_PRECONDITION
                                        .withDescription("Cannot confirm: payment was not authorized")
                                        .asRuntimeException()
                        );
                        return;
                    }
                    record.setStatus(PaymentStatus.CONFIRMED.name());
                    paymentRecordRepository.save(record);
                    responseObserver.onNext(PaymentResponse.newBuilder()
                            .setAuthorizationId(record.getId())
                            .setStatus(PaymentStatus.CONFIRMED)
                            .setMessage("Payment confirmed")
                            .build());
                    responseObserver.onCompleted();
                },
                () -> responseObserver.onError(
                        Status.NOT_FOUND
                                .withDescription("Authorization not found: " + request.getAuthorizationId())
                                .asRuntimeException()
                )
        );
    }

    @Override
    public void reversePayment(ReversePaymentRequest request, StreamObserver<PaymentResponse> responseObserver) {
        paymentRecordRepository.findById(request.getAuthorizationId()).ifPresentOrElse(
                record -> {
                    record.setStatus(PaymentStatus.REVERSED.name());
                    paymentRecordRepository.save(record);
                    responseObserver.onNext(PaymentResponse.newBuilder()
                            .setAuthorizationId(record.getId())
                            .setStatus(PaymentStatus.REVERSED)
                            .setMessage("Payment reversed: " + request.getReason())
                            .build());
                    responseObserver.onCompleted();
                },
                () -> responseObserver.onError(
                        Status.NOT_FOUND
                                .withDescription("Authorization not found: " + request.getAuthorizationId())
                                .asRuntimeException()
                )
        );
    }
}

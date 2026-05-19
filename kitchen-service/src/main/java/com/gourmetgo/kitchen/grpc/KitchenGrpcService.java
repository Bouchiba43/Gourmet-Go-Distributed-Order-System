package com.gourmetgo.kitchen.grpc;

import com.gourmetgo.kitchen.domain.Ticket;
import com.gourmetgo.kitchen.repository.TicketRepository;
import com.gourmetgo.proto.kitchen.*;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.UUID;

@GrpcService
public class KitchenGrpcService extends KitchenServiceGrpc.KitchenServiceImplBase {

    private final TicketRepository ticketRepository;

    @Autowired
    public KitchenGrpcService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Override
    public void createTicket(CreateTicketRequest request, StreamObserver<TicketResponse> responseObserver) {
        Ticket ticket = new Ticket(
                UUID.randomUUID().toString(),
                request.getOrderId(),
                TicketStatus.AWAITING_ACCEPTANCE.name()
        );

        ticketRepository.save(ticket);

        responseObserver.onNext(toResponse(ticket));
        responseObserver.onCompleted();
    }

    @Override
    public void getTicket(GetTicketRequest request, StreamObserver<TicketResponse> responseObserver) {
        ticketRepository.findById(request.getTicketId()).ifPresentOrElse(
                ticket -> {
                    responseObserver.onNext(toResponse(ticket));
                    responseObserver.onCompleted();
                },
                () -> responseObserver.onError(
                        Status.NOT_FOUND
                                .withDescription("Ticket not found: " + request.getTicketId())
                                .asRuntimeException()
                )
        );
    }

    @Override
    public void confirmTicket(ConfirmTicketRequest request, StreamObserver<TicketResponse> responseObserver) {
        ticketRepository.findById(request.getTicketId()).ifPresentOrElse(
                ticket -> {
                    ticket.setStatus(TicketStatus.ACCEPTED.name());
                    ticketRepository.save(ticket);
                    responseObserver.onNext(toResponse(ticket));
                    responseObserver.onCompleted();
                },
                () -> responseObserver.onError(
                        Status.NOT_FOUND
                                .withDescription("Ticket not found: " + request.getTicketId())
                                .asRuntimeException()
                )
        );
    }

    @Override
    public void cancelTicket(CancelTicketRequest request, StreamObserver<TicketResponse> responseObserver) {
        ticketRepository.findById(request.getTicketId()).ifPresentOrElse(
                ticket -> {
                    ticket.setStatus(TicketStatus.CANCELLED.name());
                    ticketRepository.save(ticket);
                    responseObserver.onNext(toResponse(ticket));
                    responseObserver.onCompleted();
                },
                () -> responseObserver.onError(
                        Status.NOT_FOUND
                                .withDescription("Ticket not found: " + request.getTicketId())
                                .asRuntimeException()
                )
        );
    }

    @Override
    public void rejectTicket(RejectRequest request, StreamObserver<RejectResponse> responseObserver) {
        ticketRepository.findById(request.getTicketId()).ifPresentOrElse(
                ticket -> {
                    ticket.setStatus("REJECTED");
                    ticketRepository.save(ticket);
                    responseObserver.onNext(RejectResponse.newBuilder().setAcknowledged(true).build());
                    responseObserver.onCompleted();
                },
                () -> responseObserver.onError(
                        Status.NOT_FOUND
                                .withDescription("Ticket not found: " + request.getTicketId())
                                .asRuntimeException()
                )
        );
    }

    private TicketResponse toResponse(Ticket ticket) {
        TicketStatus protoStatus;
        try {
            protoStatus = TicketStatus.valueOf(ticket.getStatus());
        } catch (IllegalArgumentException e) {
            protoStatus = TicketStatus.CANCELLED;
        }
        return TicketResponse.newBuilder()
                .setTicketId(ticket.getId())
                .setOrderId(ticket.getOrderId())
                .setStatus(protoStatus)
                .build();
    }
}

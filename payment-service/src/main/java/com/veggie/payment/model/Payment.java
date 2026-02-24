package com.veggie.payment.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;
    private Long userId;

    private BigDecimal amount;
    private String status; // SUCCESSFUL, FAILED, PENDING
    private String paymentMethod; // CREDIT_CARD, GOOGLE_PAY, COD
    private String transactionId;

    private LocalDateTime createdAt;
}

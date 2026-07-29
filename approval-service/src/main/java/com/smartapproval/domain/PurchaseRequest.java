package com.smartapproval.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "purchase_requests")
public class PurchaseRequest {
    @Id
    private UUID id;
    @Column(nullable = false)
    private String requesterName;
    @Column(nullable = false)
    private String requesterEmail;
    @Column(nullable = false)
    private String concept;
    @Column(nullable = false, length = 2000)
    private String description;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;
    @Column(nullable = false)
    private String costCenter;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;
    private String decisionComment;
    @Column(nullable = false)
    private Instant createdAt;
    @Column(nullable = false)
    private Instant updatedAt;

    protected PurchaseRequest() {
    }

    public PurchaseRequest(UUID id, String requesterName, String requesterEmail, String concept, String description,
            BigDecimal amount, String costCenter, RequestStatus status, Instant now) {
        this.id = id;
        this.requesterName = requesterName;
        this.requesterEmail = requesterEmail;
        this.concept = concept;
        this.description = description;
        this.amount = amount;
        this.costCenter = costCenter;
        this.status = status;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public UUID getId() {
        return id;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public String getRequesterEmail() {
        return requesterEmail;
    }

    public String getConcept() {
        return concept;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCostCenter() {
        return costCenter;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public String getDecisionComment() {
        return decisionComment;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void decide(RequestStatus status, String comment) {
        this.status = status;
        this.decisionComment = comment;
        this.updatedAt = Instant.now();
    }
}

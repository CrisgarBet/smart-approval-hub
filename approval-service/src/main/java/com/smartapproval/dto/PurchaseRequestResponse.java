package com.smartapproval.dto;
import com.smartapproval.domain.RequestStatus; import java.math.BigDecimal; import java.time.Instant; import java.util.UUID;
public record PurchaseRequestResponse(UUID id,String requesterName,String requesterEmail,String concept,String description,BigDecimal amount,String costCenter,RequestStatus status,String decisionComment,Instant createdAt,Instant updatedAt) {}

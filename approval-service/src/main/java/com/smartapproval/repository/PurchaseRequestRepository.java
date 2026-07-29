package com.smartapproval.repository;

import com.smartapproval.domain.PurchaseRequest;
import com.smartapproval.domain.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequest, UUID> {
    List<PurchaseRequest> findAllByOrderByCreatedAtDesc();

    List<PurchaseRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status);

    List<PurchaseRequest> findByRequesterNameContainingIgnoreCaseOrConceptContainingIgnoreCaseOrderByCreatedAtDesc(
            String requesterName, String concept);

    List<PurchaseRequest> findByStatusAndRequesterNameContainingIgnoreCaseOrStatusAndConceptContainingIgnoreCaseOrderByCreatedAtDesc(
            RequestStatus requesterStatus, String requesterName, RequestStatus conceptStatus, String concept);
}

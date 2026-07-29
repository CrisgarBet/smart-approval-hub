package com.smartapproval.web;
import com.smartapproval.domain.RequestStatus; import com.smartapproval.dto.*; import com.smartapproval.service.PurchaseRequestService; import jakarta.validation.Valid; import org.springframework.http.*; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api/purchase-requests") public class PurchaseRequestController { private final PurchaseRequestService service; public PurchaseRequestController(PurchaseRequestService service){this.service=service;}
 @PostMapping public ResponseEntity<PurchaseRequestResponse> create(@Valid @RequestBody CreatePurchaseRequest body){return ResponseEntity.status(HttpStatus.CREATED).body(service.create(body));}
 @GetMapping public List<PurchaseRequestResponse> list(@RequestParam(required=false) RequestStatus status,@RequestParam(required=false) String search){return service.list(status,search);}
 @GetMapping("/{id}") public PurchaseRequestResponse get(@PathVariable UUID id){return service.get(id);} @PatchMapping("/{id}/approve") public PurchaseRequestResponse approve(@PathVariable UUID id,@RequestBody(required=false) DecisionRequest b){return service.approve(id,b==null?null:b.comment());}
 @PatchMapping("/{id}/reject") public PurchaseRequestResponse reject(@PathVariable UUID id,@Valid @RequestBody RejectRequest b){return service.reject(id,b.comment());} @GetMapping("/metrics") public MetricsResponse metrics(){return service.metrics();}
}

package com.smartapproval.dto;
import jakarta.validation.constraints.*; import java.math.BigDecimal;
public record CreatePurchaseRequest(@NotBlank String requesterName,@NotBlank @Email String requesterEmail,@NotBlank String concept,@NotBlank String description,@NotNull @DecimalMin(value="0.01") BigDecimal amount,@NotBlank String costCenter) {}

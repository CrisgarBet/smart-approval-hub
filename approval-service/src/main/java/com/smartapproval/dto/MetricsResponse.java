package com.smartapproval.dto; import java.math.BigDecimal; public record MetricsResponse(long total,long pending,long approved,long rejected,BigDecimal totalAmount) {}

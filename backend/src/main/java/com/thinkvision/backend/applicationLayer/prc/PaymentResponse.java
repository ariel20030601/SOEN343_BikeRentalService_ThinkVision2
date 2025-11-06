package com.thinkvision.backend.applicationLayer.prc;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PaymentResponse {
    private String status; // e.g. "SUCCESS" or "FAILED"
    private String transactionId;
    private String message;

    public PaymentResponse() {}

    public boolean isSuccess() {
        return "SUCCESS".equalsIgnoreCase(status) || "OK".equalsIgnoreCase(status);
    }
}

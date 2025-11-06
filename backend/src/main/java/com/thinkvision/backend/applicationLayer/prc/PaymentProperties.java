package com.thinkvision.backend.applicationLayer.prc;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Setter
@Getter
@Component
@ConfigurationProperties(prefix = "payment")
public class PaymentProperties {
    /**
     * Example properties in application.yml:
     * payment:
     *   base-url: https://payments.example.com/api
     *   api-key: your-key
     *   timeout-ms: 5000
     */
    private String baseUrl;
    private String apiKey;
    private int timeoutMs = 5000;

}

package com.thinkvision.backend.applicationLayer.prc;

import com.thinkvision.backend.entity.Trip;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

public class HttpPaymentService implements PaymentService {

    private final WebClient webClient;
    private final PaymentProperties props;

    @Autowired
    public HttpPaymentService(WebClient.Builder webClientBuilder, PaymentProperties props) {
        this.props = props;
        this.webClient = webClientBuilder
                .baseUrl(props.getBaseUrl())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("X-API-KEY", props.getApiKey() == null ? "" : props.getApiKey())
                .build();
    }

    @Override
    public boolean processPayment(Trip trip, double amount) {
        PaymentRequest req = new PaymentRequest(
                trip.getId(),
                trip.getRider() != null ? trip.getRider().getId() : null,
                amount,
                "USD",
                "Trip payment for tripId=" + trip.getId()
        );

        try {
            Mono<PaymentResponse> respMono = webClient.post()
                    .uri("/payments")
                    .bodyValue(req)
                    .retrieve()
                    .bodyToMono(PaymentResponse.class)
                    .timeout(Duration.ofMillis(props.getTimeoutMs()));

            PaymentResponse resp = respMono.block(); // synchronous call; acceptable in service handling events
            return resp != null && resp.isSuccess();
        } catch (Exception e) {
            // log error in real code; return false so caller can decide (retry/store pending)
            System.err.println("HttpPaymentService: payment call failed: " + e.getMessage());
            return false;
        }
    }
}

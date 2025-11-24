package com.thinkvision.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email; // needs to be valid

    @Column(nullable = false, unique = true) // must be unique
    private String username;

    @JsonIgnore
    @Column(nullable = false)
    private String passwordHash;

    private String paymentInfo; //temporary

    private String role;

    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "loyalty_tier")
    private LoyaltyTier loyaltyTier = LoyaltyTier.NONE;
    @Column(name = "flex_balance")
    private Double flexBalance;

    public User() {}

}


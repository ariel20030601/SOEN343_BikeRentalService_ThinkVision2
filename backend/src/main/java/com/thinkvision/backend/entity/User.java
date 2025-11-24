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

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName= firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public User() {}

    public void setAddress(String address) {
        this.address = address;
    }

    public double getFlexBalance() {
        return flexBalance == null ? 0.0 : flexBalance;
    }

    public void setFlexBalance(Double flexDollarBalance) {
        this.flexBalance = flexDollarBalance;
    }
}


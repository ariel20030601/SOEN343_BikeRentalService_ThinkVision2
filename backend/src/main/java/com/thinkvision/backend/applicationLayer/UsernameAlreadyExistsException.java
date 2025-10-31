package com.thinkvision.backend.applicationLayer;

public class UsernameAlreadyExistsException extends RuntimeException {
    public UsernameAlreadyExistsException() { super(); }
    public UsernameAlreadyExistsException(String message) { super(message); }
}

package com.compilingjava.auth.service.exceptions;

public class InvalidTokenException extends RuntimeException {
    public InvalidTokenException() {
        super("Reset link is invalid.");
    }

    public InvalidTokenException(String msg) {
        super(msg);
    }
}

package com.compilingjava.auth.service.exceptions;

public class ExpiredOrUsedTokenException extends RuntimeException {
    public ExpiredOrUsedTokenException() {
        super("Reset link is expired or already used.");
    }

    public ExpiredOrUsedTokenException(String msg) {
        super(msg);
    }
}

package com.compilingjava.auth.service.exceptions;

public class WeakPasswordException extends RuntimeException {
    public WeakPasswordException(String msg) {
        super(msg);
    }
}

// src/main/java/com/compilingjava/auth/service/exceptions/EmailDeliveryException.java
package com.compilingjava.auth.service.exceptions;

public class EmailDeliveryException extends RuntimeException {
    public EmailDeliveryException(String message, Throwable cause) {
        super(message, cause);
    }

    public EmailDeliveryException(String message) {
        super(message);
    }
}

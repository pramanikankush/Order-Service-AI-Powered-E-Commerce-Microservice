package com.ankush.orderservice.exception;

public class EmptyCartException extends RuntimeException {
    public EmptyCartException(String msg) { super(msg); }
}

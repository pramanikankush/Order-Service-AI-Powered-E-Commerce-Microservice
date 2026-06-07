package com.ankush.orderservice.exception;

public class DuplicateSkuException extends RuntimeException {
    public DuplicateSkuException(String msg) { super(msg); }
}

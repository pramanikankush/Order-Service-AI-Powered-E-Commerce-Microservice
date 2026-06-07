package com.ankush.orderservice.kafka;

public class KafkaSendException extends RuntimeException {
    public KafkaSendException(String msg, Throwable cause) { super(msg, cause); }
}

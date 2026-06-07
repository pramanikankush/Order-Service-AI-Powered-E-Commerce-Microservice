package com.ankush.orderservice.util;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

public final class Ids {
    private Ids() {}
    public static String orderNumber() {
        return "ORD-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase()
                + "-" + String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
    }
}

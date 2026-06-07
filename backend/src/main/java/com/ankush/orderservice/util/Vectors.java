package com.ankush.orderservice.util;

import java.util.stream.Collectors;
import java.util.List;

public final class Vectors {
    private Vectors() {}

    public static String toCsv(List<Double> v) {
        if (v == null) return null;
        return v.stream().map(String::valueOf).collect(Collectors.joining(","));
    }
    public static String toCsv(double[] v) {
        if (v == null) return null;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < v.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(v[i]);
        }
        return sb.toString();
    }
    public static String toCsv(float[] v) {
        if (v == null) return null;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < v.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(v[i]);
        }
        return sb.toString();
    }
}

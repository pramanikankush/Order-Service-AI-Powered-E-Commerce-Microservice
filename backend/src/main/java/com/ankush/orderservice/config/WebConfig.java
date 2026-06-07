package com.ankush.orderservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * CORS configuration. Allowed origins are read from the
 * <code>app.cors.allowed-origins</code> property (comma-separated). Defaults
 * cover local dev hosts; override <code>APP_CORS_ALLOWED_ORIGINS</code> in
 * production to your real frontend origins.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final List<String> allowedOrigins;

    public WebConfig(@Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173}") String originsCsv) {
        this.allowedOrigins = Stream.of(originsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toUnmodifiableList());
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("X-Owner-Key")
                .allowCredentials(true)
                .maxAge(3600);
    }
}

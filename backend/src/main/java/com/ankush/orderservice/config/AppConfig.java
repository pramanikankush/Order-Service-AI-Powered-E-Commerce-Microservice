package com.ankush.orderservice.config;

import com.ankush.orderservice.kafka.OutboxProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(OutboxProperties.class)
public class AppConfig {}

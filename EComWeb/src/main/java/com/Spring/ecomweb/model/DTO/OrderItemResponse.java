package com.Spring.ecomweb.model.DTO;

import java.math.BigDecimal;


public record OrderItemResponse(
        String productName,
        int quantity,
        BigDecimal totalPrice
) {}
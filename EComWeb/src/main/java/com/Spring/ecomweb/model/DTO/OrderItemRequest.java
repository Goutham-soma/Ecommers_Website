package com.Spring.ecomweb.model.DTO;

public record OrderItemRequest(
        int productId,
        int quantity
) {}
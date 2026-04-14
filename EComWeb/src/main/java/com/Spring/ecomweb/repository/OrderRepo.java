package com.Spring.ecomweb.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Spring.ecomweb.model.Order;

public interface OrderRepo extends JpaRepository<Order, Integer>{
	Optional<Order>findByOrderId(String orderId);
}

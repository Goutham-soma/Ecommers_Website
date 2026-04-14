package com.Spring.ecomweb.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Spring.ecomweb.model.users;

import java.util.List;

@Repository
public interface homeRepo extends JpaRepository<users, Integer> {
	Optional<users> findByEmailOrMobile(String email, String mobile);
	Optional<users> findByEmail(String email);
	
	List<users> findByRoleId(Integer roleId);
	
}

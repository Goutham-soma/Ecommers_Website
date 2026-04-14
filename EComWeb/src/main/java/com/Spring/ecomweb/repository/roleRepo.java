package com.Spring.ecomweb.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Spring.ecomweb.model.Role;

@Repository
public interface roleRepo extends JpaRepository<Role, Long>{
	Optional<Role> findByRoleName(String roleName);
}

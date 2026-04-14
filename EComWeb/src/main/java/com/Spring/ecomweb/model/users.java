package com.Spring.ecomweb.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity(name="all_users")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class users
{
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	
	private String firstname;
	private String lastname;
	private String email;
	private String mobile;
	private String password;
	private String status; // ACTIVE / INACTIVE
	
	@ManyToOne
	@JoinColumn(name="role_id")
	private Role role;
}
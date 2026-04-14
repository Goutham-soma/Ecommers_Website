package com.Spring.ecomweb.model.DTO;

import lombok.Data;

@Data
public class registerRequest {
	private String firstName;
    private String lastName;
    private String email;
    private String mobile;
    private String password;
}

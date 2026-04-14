package com.Spring.ecomweb.model.DTO;

import lombok.Data;

@Data
public class loginRequest {
	
	private String emailOrPhone;
	private String password;
	
	public String getEmailOrPhone() {
		return emailOrPhone;
	}
	public void setEmailOrPhone(String emailOrPhone) {
		this.emailOrPhone = emailOrPhone;
	}
	
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
}

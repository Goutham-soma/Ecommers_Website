package com.Spring.ecomweb.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.Spring.ecomweb.model.Product;
import com.Spring.ecomweb.service.ProductService;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class ProductController {
	
	@Autowired
	private ProductService productservice;
	
	@GetMapping("/products")
	public List<Product> getProducts()
	{
		 return productservice.getAllProducts();
	}
	
	@GetMapping("/product/{id}")
	public ResponseEntity<Product> getProductById(@PathVariable int id)
	{
		Product product = productservice.getProductById(id);
		if(product != null)
			return new ResponseEntity<>(product,HttpStatus.OK);
		else
			return new ResponseEntity<>(product,HttpStatus.NOT_FOUND);
	}
	
    @PostMapping("/product")
    public ResponseEntity<?> addProduct(@RequestPart Product product, @RequestPart MultipartFile imageFile) {
        Product savedProduct = null;
        try {
            savedProduct = productservice.addOrUpdateProduct(product, imageFile);
            return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
        } catch (IOException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
	
	@GetMapping("/product/{productId}/image")
	public ResponseEntity<byte[]> getProductImage(@PathVariable int productId)
	{
		Product product = productservice.getProductById(productId);
		return new ResponseEntity<>(product.getImageData(),HttpStatus.OK);
	}
	
	@PutMapping("/product/{id}")
	public ResponseEntity<String> updateProduct(
	    @PathVariable int id,
	    @RequestPart Product product,
	    @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) // ✅ add required=false
	{
	    try {
	        productservice.addOrUpdateProduct(product, imageFile);
	        return new ResponseEntity<>("Updated", HttpStatus.OK);
	    } catch (IOException e) {
	        return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
	    }
	}
	
	@DeleteMapping("/product/{id}")
	public ResponseEntity<String> deleeProduct(@PathVariable int id)
	{
		Product product = productservice.getProductById(id);
		if(product != null)
		{
			productservice.deleteProduct(id);
			return new ResponseEntity<>("Deleted",HttpStatus.OK);
		}
		else
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
	}
	
	@GetMapping("/products/search")
	public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword)
	{
		List<Product> products = productservice.searchProducts(keyword);
		System.out.println("Searching with "+keyword);
		return new ResponseEntity<>(products,HttpStatus.OK);
	}
}

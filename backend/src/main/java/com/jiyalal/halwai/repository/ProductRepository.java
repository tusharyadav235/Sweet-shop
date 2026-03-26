package com.jiyalal.halwai.repository;

import com.jiyalal.halwai.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);
    List<Product> findByInStock(Boolean inStock);
}

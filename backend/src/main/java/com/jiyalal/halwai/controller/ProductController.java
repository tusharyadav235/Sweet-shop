package com.jiyalal.halwai.controller;

import com.jiyalal.halwai.model.Product;
import com.jiyalal.halwai.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired private ProductRepository productRepo;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    // ── PUBLIC ──

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAll(@RequestParam(required = false) String category) {
        List<Product> products = (category != null && !category.isBlank())
            ? productRepo.findByCategory(category)
            : productRepo.findAll();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        return productRepo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // ── ADMIN: CREATE PRODUCT ──
    @PostMapping(value = "/admin/products", consumes = "multipart/form-data")
    public ResponseEntity<?> create(
        @RequestParam("name")                        String name,
        @RequestParam("category")                    String category,
        @RequestParam("price")                       String priceStr,
        @RequestParam(value = "unit",        required = false) String unit,
        @RequestParam(value = "description", required = false) String description,
        @RequestParam(value = "inStock",     required = false, defaultValue = "true") String inStockStr,
        @RequestParam(value = "image",       required = false) MultipartFile image
    ) {
        try {
            double price   = Double.parseDouble(priceStr);
            boolean inStock = Boolean.parseBoolean(inStockStr);

            Product p = Product.builder()
                .name(name).category(category).price(price)
                .unit(unit != null ? unit : "").description(description != null ? description : "")
                .inStock(inStock).build();

            if (image != null && !image.isEmpty()) {
                p.setImageUrl(saveImage(image));
            }
            return ResponseEntity.ok(productRepo.save(p));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to save product: " + e.getMessage()));
        }
    }

    // ── ADMIN: UPDATE PRODUCT ──
    @PostMapping(value = "/admin/products/{id}", consumes = "multipart/form-data")
    public ResponseEntity<?> update(
        @PathVariable Long id,
        @RequestParam(value = "name",        required = false) String name,
        @RequestParam(value = "category",    required = false) String category,
        @RequestParam(value = "price",       required = false) String priceStr,
        @RequestParam(value = "unit",        required = false) String unit,
        @RequestParam(value = "description", required = false) String description,
        @RequestParam(value = "inStock",     required = false) String inStockStr,
        @RequestParam(value = "image",       required = false) MultipartFile image
    ) {
        return productRepo.findById(id).map(p -> {
            try {
                if (name        != null) p.setName(name);
                if (category    != null) p.setCategory(category);
                if (priceStr    != null) p.setPrice(Double.parseDouble(priceStr));
                if (unit        != null) p.setUnit(unit);
                if (description != null) p.setDescription(description);
                if (inStockStr  != null) p.setInStock(Boolean.parseBoolean(inStockStr));
                if (image != null && !image.isEmpty()) p.setImageUrl(saveImage(image));
                return ResponseEntity.ok(productRepo.save(p));
            } catch (Exception e) {
                return ResponseEntity.<Product>badRequest().build();
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── ADMIN: DELETE PRODUCT ──
    @DeleteMapping("/admin/products/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!productRepo.existsById(id))
            return ResponseEntity.notFound().build();
        productRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }

    // ── SAVE IMAGE TO DISK ──
    private String saveImage(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

        // Sanitize filename
        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
            ? original.substring(original.lastIndexOf('.')) : ".jpg";
        String filename = UUID.randomUUID().toString() + ext;

        Path dest = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/" + filename;
    }
}

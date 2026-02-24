package com.veggie.product.service;

import com.veggie.product.model.Product;
import com.veggie.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final jakarta.persistence.EntityManager entityManager;

    @jakarta.annotation.PostConstruct
    @jakarta.transaction.Transactional
    public void migrateSchema() {
        try {
            // Using more robust PostgreSQL specific casting to ensure columns are TEXT
            entityManager
                    .createNativeQuery("ALTER TABLE products ALTER COLUMN image_url TYPE TEXT USING image_url::TEXT")
                    .executeUpdate();
            entityManager
                    .createNativeQuery(
                            "ALTER TABLE products ALTER COLUMN description TYPE TEXT USING description::TEXT")
                    .executeUpdate();
        } catch (Exception e) {
            // Ignore if already text, or if columns don't exist yet (Hibernate will create
            // them)
            System.err.println("Migration warning (can likely be ignored): " + e.getMessage());
        }
    }

    public List<Product> getAllActiveProducts() {
        return productRepository.findByActiveTrue();
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndActiveTrue(category);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public Product createProduct(Product product) {
        if (product.getImageUrl() == null || product.getImageUrl().isEmpty()) {
            product.setImageUrl("https://images.unsplash.com/photo-1576045057995-568f588f82fb");
        }
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        Product product = getProductById(id);
        product.setName(updatedProduct.getName());
        product.setDescription(updatedProduct.getDescription());
        product.setPrice(updatedProduct.getPrice());
        product.setUnit(updatedProduct.getUnit());
        product.setStock(updatedProduct.getStock());
        product.setCategory(updatedProduct.getCategory());
        product.setImageUrl(updatedProduct.getImageUrl());
        product.setActive(updatedProduct.isActive());
        return productRepository.save(product);
    }

    public void reduceStock(Long id, Integer quantity) {
        Product product = getProductById(id);
        if (product.getStock() != null) {
            if (quantity > 0 && product.getStock() < quantity) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName() +
                        ". Available: " + product.getStock() + ", Requested: " + quantity);
            }
            product.setStock(product.getStock() - quantity);
            productRepository.save(product);
        }
    }

    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        product.setActive(false);
        productRepository.save(product);
    }
}

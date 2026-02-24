package com.veggie.cart.service;

import com.veggie.cart.model.Cart;
import com.veggie.cart.model.CartItem;
import com.veggie.cart.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final org.springframework.web.client.RestTemplate restTemplate;

    @org.springframework.beans.factory.annotation.Value("${product-service.url:http://localhost:8082}")
    private String productServiceUrl;

    public Cart getCartByUserId(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(Cart.builder().userId(userId).build()));
    }

    @Transactional
    public Cart addToCart(Long userId, CartItem item) {
        // Fetch current stock from product-service
        com.veggie.cart.dto.ProductDTO product = restTemplate.getForObject(
                productServiceUrl + "/api/products/" + item.getProductId(),
                com.veggie.cart.dto.ProductDTO.class);

        if (product == null) {
            throw new RuntimeException("Product not found");
        }

        Cart cart = getCartByUserId(userId);

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(item.getProductId()))
                .findFirst();

        int totalRequested = item.getQuantity();
        if (existingItem.isPresent()) {
            totalRequested += existingItem.get().getQuantity();
        }

        if (product.getStock() != null && totalRequested > product.getStock()) {
            throw new RuntimeException("Cannot add more to cart. Total requested (" + totalRequested +
                    ") exceeds available stock (" + product.getStock() + ") for " + product.getName());
        }

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(totalRequested);
        } else {
            item.setCart(cart);
            cart.getItems().add(item);
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeItem(Long userId, Long productId) {
        Cart cart = getCartByUserId(userId);
        cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        return cartRepository.save(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getCartByUserId(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}

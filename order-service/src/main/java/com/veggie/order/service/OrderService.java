package com.veggie.order.service;

import com.veggie.order.model.Order;
import com.veggie.order.model.OrderItem;
import com.veggie.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final org.springframework.web.client.RestTemplate restTemplate;

    public Order placeOrder(Order order) {
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus("PENDING");

        for (OrderItem item : order.getItems()) {
            item.setOrder(order);
            // Deduct stock from product-service
            try {
                restTemplate.postForEntity(
                        "http://product-service/api/products/" + item.getProductId() + "/reduce-stock?quantity="
                                + item.getQuantity(),
                        null,
                        Void.class);
            } catch (Exception e) {
                // Fail the order if stock reduction fails
                throw new RuntimeException("Failed to place order: " + e.getMessage());
            }
        }

        return orderRepository.save(order);
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order updateOrderStatus(Long id, String status) {
        Order order = getOrderById(id);
        String oldStatus = order.getStatus();
        order.setStatus(status);

        // If status changes to CANCELLED, restore stock
        if ("CANCELLED".equalsIgnoreCase(status) && !"CANCELLED".equalsIgnoreCase(oldStatus)) {
            for (OrderItem item : order.getItems()) {
                try {
                    // Use negative quantity to increase stock back
                    restTemplate.postForEntity(
                            "http://product-service/api/products/" + item.getProductId() + "/reduce-stock?quantity="
                                    + (-item.getQuantity()),
                            null,
                            Void.class);
                } catch (Exception e) {
                    System.err.println(
                            "Failed to restore stock for product " + item.getProductId() + ": " + e.getMessage());
                }
            }
        }

        return orderRepository.save(order);
    }
}

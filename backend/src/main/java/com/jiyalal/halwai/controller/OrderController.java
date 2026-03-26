package com.jiyalal.halwai.controller;

import com.jiyalal.halwai.model.*;
import com.jiyalal.halwai.repository.*;
import com.jiyalal.halwai.service.OrderNumberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class OrderController {

    @Autowired private OrderRepository orderRepo;
    @Autowired private ProductRepository productRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private OrderNumberService orderNumberService;

    // ── PLACE ORDER ──
    @PostMapping("/orders")
    public ResponseEntity<Order> placeOrder(
        @RequestBody Map<String, Object> req,
        @org.springframework.security.core.annotation.AuthenticationPrincipal User currentUser
    ) {
        Order order = new Order();

        // Generate unique order number — guaranteed unique, never reused
        order.setOrderNumber(orderNumberService.generateOrderNumber());

        order.setCustomerName((String) req.get("customerName"));
        order.setCustomerEmail((String) req.get("customerEmail"));
        order.setCustomerPhone((String) req.get("customerPhone"));
        order.setDeliveryAddress((String) req.get("deliveryAddress"));
        order.setPincode((String) req.get("pincode"));
        order.setCity((String) req.get("city"));
        order.setPaymentMethod((String) req.get("paymentMethod"));
        if (req.get("total") != null) {
            order.setTotal(Double.parseDouble(req.get("total").toString()));
        }
        if (currentUser != null) order.setUser(currentUser);

        // Build order items
        List<OrderItem> items = new ArrayList<>();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rawItems = (List<Map<String, Object>>) req.get("items");
        if (rawItems != null) {
            for (Map<String, Object> ri : rawItems) {
                OrderItem item = new OrderItem();
                Long productId = Long.parseLong(ri.get("productId").toString());
                item.setQuantity(Integer.parseInt(ri.get("quantity").toString()));
                item.setPrice(Double.parseDouble(ri.get("price").toString()));
                productRepo.findById(productId).ifPresent(item::setProduct);
                item.setOrder(order);
                items.add(item);
            }
        }
        order.setItems(items);
        order.setStatus(Order.OrderStatus.PENDING);

        Order saved = orderRepo.save(order);
        return ResponseEntity.ok(saved);
    }

    // ── MY ORDERS (logged-in user) ──
    @GetMapping("/orders/my")
    public ResponseEntity<?> myOrders(
        @org.springframework.security.core.annotation.AuthenticationPrincipal User user
    ) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(orderRepo.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    // ── TRACK ORDER BY ORDER NUMBER (public) ──
    @GetMapping("/orders/track/{orderNumber}")
    public ResponseEntity<?> trackOrder(@PathVariable String orderNumber) {
        return orderRepo.findByOrderNumber(orderNumber)
            .map(order -> ResponseEntity.ok(Map.of(
                "orderNumber", order.getOrderNumber(),
                "status",      order.getStatus(),
                "customerName",order.getCustomerName(),
                "total",       order.getTotal(),
                "createdAt",   order.getCreatedAt().toString(),
                "items",       order.getItems()
            )))
            .orElse(ResponseEntity.notFound().build());
    }

    // ── ADMIN: ALL ORDERS ──
    @GetMapping("/admin/orders")
    public List<Order> allOrders(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            try { return orderRepo.findByStatus(Order.OrderStatus.valueOf(status)); }
            catch (Exception ignored) {}
        }
        return orderRepo.findAllByOrderByCreatedAtDesc();
    }

    // ── ADMIN: SINGLE ORDER ──
    @GetMapping("/admin/orders/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        return orderRepo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // ── ADMIN: UPDATE STATUS ──
    @PutMapping("/admin/orders/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> req) {
        return orderRepo.findById(id).map(order -> {
            order.setStatus(Order.OrderStatus.valueOf(req.get("status")));
            return ResponseEntity.ok(orderRepo.save(order));
        }).orElse(ResponseEntity.notFound().build());
    }
}

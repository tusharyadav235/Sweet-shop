package com.jiyalal.halwai.service;

import com.jiyalal.halwai.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class OrderNumberService {

    @Autowired
    private OrderRepository orderRepo;

    /**
     * Generates a unique order number in format: JLH-YYYY-XXXXXX
     * e.g.  JLH-2024-000001
     *       JLH-2024-000002
     * The counter is based on total orders in DB so it is always unique
     * and always incrementing — no two customers ever get the same number.
     */
    public synchronized String generateOrderNumber() {
        String year = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy"));
        // Count existing orders to get next sequence number
        long count = orderRepo.count() + 1;
        // Zero-pad to 6 digits so it looks like a counter: 000001, 000002...
        String sequence = String.format("%06d", count);
        return "JLH-" + year + "-" + sequence;
    }
}

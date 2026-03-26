package com.jiyalal.halwai.config;

import com.jiyalal.halwai.model.Product;
import com.jiyalal.halwai.model.User;
import com.jiyalal.halwai.repository.ProductRepository;
import com.jiyalal.halwai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private ProductRepository productRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create default admin
        if (!userRepo.existsByEmail("admin@jiyalalhalwai.com")) {
            userRepo.save(User.builder()
                .name("Admin")
                .email("admin@jiyalalhalwai.com")
                .password(passwordEncoder.encode("admin123"))
                .phone("+91 98765 43210")
                .role(User.Role.ADMIN)
                .build());
            System.out.println("✅ Default admin created: admin@jiyalalhalwai.com / admin123");
        }

        // Seed products if empty
        if (productRepo.count() == 0) {
            productRepo.save(Product.builder().name("Kaju Katli").category("Mithai").price(650.0).unit("250g").emoji("🟡").description("Premium cashew barfi made with pure ghee and finest kaju. Silver vark coated.").inStock(true).build());
            productRepo.save(Product.builder().name("Besan Ladoo").category("Mithai").price(320.0).unit("500g").emoji("🟠").description("Soft, melt-in-mouth ladoos from roasted gram flour and desi ghee with cardamom.").inStock(true).build());
            productRepo.save(Product.builder().name("Gulab Jamun").category("Mithai").price(280.0).unit("500g").emoji("🟤").description("Khoya-based dumplings soaked in rose-saffron sugar syrup. Served warm.").inStock(true).build());
            productRepo.save(Product.builder().name("Diwali Gift Hamper").category("Gift Boxes").price(2200.0).unit("Hamper").emoji("🪔").description("Grand Diwali hamper with sweets, dry fruits and namkeen in a decorated box.").inStock(true).build());
            productRepo.save(Product.builder().name("Soan Papdi").category("Mithai").price(350.0).unit("400g").emoji("🌼").description("Flaky, melt-in-mouth cardamom flavored sweet threads. A classic festive sweet.").inStock(true).build());
            productRepo.save(Product.builder().name("Mathri").category("Namkeen").price(200.0).unit("400g").emoji("🫓").description("Crispy fried crackers spiced with ajwain and black pepper. Perfect with chai.").inStock(true).build());
            productRepo.save(Product.builder().name("Mix Dry Fruits").category("Dry Fruits").price(1200.0).unit("500g").emoji("🌰").description("Premium almonds, cashews, pistachios, raisins and walnuts. No shell.").inStock(true).build());
            productRepo.save(Product.builder().name("Jalebi").category("Mithai").price(180.0).unit("500g").emoji("🍥").description("Crispy spirals dipped in saffron sugar syrup. Made fresh daily.").inStock(true).build());
            productRepo.save(Product.builder().name("Aloo Bhujia").category("Namkeen").price(150.0).unit("300g").emoji("🫘").description("Spicy, crunchy potato sev — a Varanasi street snack classic.").inStock(true).build());
            productRepo.save(Product.builder().name("Pista Barfi").category("Mithai").price(750.0).unit("250g").emoji("💚").description("Smooth pistachio barfi with silver vark topping. Pure ghee base.").inStock(true).build());
            productRepo.save(Product.builder().name("Barfi Assorted Box").category("Gift Boxes").price(850.0).unit("1kg").emoji("🎁").description("Mix of kaju, badam, pista, and coconut barfi in a premium gift box.").inStock(true).build());
            productRepo.save(Product.builder().name("Chakli").category("Namkeen").price(175.0).unit("300g").emoji("🌀").description("Crispy spiral snacks made with rice flour and spices. Festive favourite.").inStock(true).build());
            System.out.println("✅ Sample products seeded");
        }
    }
}

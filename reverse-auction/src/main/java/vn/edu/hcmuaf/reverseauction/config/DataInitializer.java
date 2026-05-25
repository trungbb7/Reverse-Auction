package vn.edu.hcmuaf.reverseauction.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import vn.edu.hcmuaf.reverseauction.entity.*;
import vn.edu.hcmuaf.reverseauction.repository.AuctionRequestRepository;
import vn.edu.hcmuaf.reverseauction.repository.CategoryRepository;
import vn.edu.hcmuaf.reverseauction.repository.ProductRepository;
import vn.edu.hcmuaf.reverseauction.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final AuctionRequestRepository auctionRequestRepository;
    private final vn.edu.hcmuaf.reverseauction.repository.BidRepository bidRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Users
        if (userRepository.count() == 0) {
            seedUsers();
        }
        
        // Ensure tks user exists for testing
        if (userRepository.findByEmail("tks@gmail.com").isEmpty()) {
            userRepository.save(User.builder()
                    .email("tks@gmail.com")
                    .password(passwordEncoder.encode("123456"))
                    .fullName("TKS Admin")
                    .role(Role.ROLE_ADMIN)
                    .enabled(true)
                    .build());
            System.out.println("Ensured tks@gmail.com user exists.");
        }

        // 2. Seed Categories
        seedCategories();

        // 3. Seed Auction Requests & Bids
        seedAuctionsAndBids();

        // 4. Seed Seller Products
        seedProducts();
    }

    private void seedUsers() {
        User admin = User.builder()
                .email("admin@gmail.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("Admin System")
                .role(Role.ROLE_ADMIN)
                .enabled(true)
                .build();
        
        User buyer = User.builder()
                .email("buyer@gmail.com")
                .password(passwordEncoder.encode("buyer123"))
                .fullName("John Buyer")
                .role(Role.ROLE_BUYER)
                .enabled(true)
                .build();

        User seller = User.builder()
                .email("seller@gmail.com")
                .password(passwordEncoder.encode("seller123"))
                .fullName("Bob Seller")
                .role(Role.ROLE_SELLER)
                .enabled(true)
                .build();

        User tks = User.builder()
                .email("tks@gmail.com")
                .password(passwordEncoder.encode("123456"))
                .fullName("TKS Admin")
                .role(Role.ROLE_ADMIN)
                .enabled(true)
                .build();

        userRepository.saveAll(Arrays.asList(admin, buyer, seller, tks));
        System.out.println("Seeded initial users.");
    }

    private void seedCategories() {
        String[] pcCategories = {"CPU - Bộ vi xử lý", "VGA - Card màn hình", "RAM - Bộ nhớ trong", "Mainboard - Bo mạch chủ", "SSD/HDD - Ổ cứng", "PSU - Nguồn máy tính", "Case - Vỏ máy tính"};
        for (String catName : pcCategories) {
            if (categoryRepository.findByName(catName).isEmpty()) {
                categoryRepository.save(Category.builder().name(catName).description("Linh kiện máy tính PC chất lượng cao").build());
            }
        }
        System.out.println("Ensured PC component categories exist.");
    }

    private void seedAuctionsAndBids() {
        User buyer = userRepository.findByEmail("buyer@gmail.com").orElse(null);
        User seller = userRepository.findByEmail("seller@gmail.com").orElse(null);
        
        if (buyer == null) return;

        Category cpuCat = categoryRepository.findByName("CPU - Bộ vi xử lý").orElse(null);
        Category vgaCat = categoryRepository.findByName("VGA - Card màn hình").orElse(null);
        Category ramCat = categoryRepository.findByName("RAM - Bộ nhớ trong").orElse(null);
        Category psuCat = categoryRepository.findByName("PSU - Nguồn máy tính").orElse(null);

        // CPU Auction
        if (cpuCat != null && auctionRequestRepository.findByTitle("Cần mua CPU Intel Core i5-13600K").isEmpty()) {
            AuctionRequest cpuAuction = AuctionRequest.builder()
                    .buyer(buyer)
                    .category(cpuCat)
                    .title("Cần mua CPU Intel Core i5-13600K")
                    .description("Yêu cầu hàng mới 100%, bảo hành chính hãng 36 tháng. Full box.")
                    .quantity(1)
                    .budgetMax(new BigDecimal("7500000"))
                    .endDate(LocalDateTime.now().plusDays(7))
                    .status(AuctionStatus.OPEN)
                    .build();
            cpuAuction = auctionRequestRepository.save(cpuAuction);
            
            if (seller != null) {
                bidRepository.save(Bid.builder()
                        .auction(cpuAuction)
                        .seller(seller)
                        .bidPrice(new BigDecimal("7200000"))
                        .note("Sẵn hàng, bảo hành Viễn Sơn 36 tháng.")
                        .isWinner(false)
                        .build());
            }
        }

        // VGA Auction
        if (vgaCat != null && auctionRequestRepository.findByTitle("Tìm mua RTX 4070 Super 12GB").isEmpty()) {
            AuctionRequest vgaAuction = AuctionRequest.builder()
                    .buyer(buyer)
                    .category(vgaCat)
                    .title("Tìm mua RTX 4070 Super 12GB")
                    .description("Ưu tiên các bản của ASUS TUF hoặc MSI Gaming X Slim. Hàng mới.")
                    .quantity(1)
                    .budgetMax(new BigDecimal("18500000"))
                    .endDate(LocalDateTime.now().plusDays(5))
                    .status(AuctionStatus.OPEN)
                    .build();
            vgaAuction = auctionRequestRepository.save(vgaAuction);

            if (seller != null) {
                bidRepository.save(Bid.builder()
                        .auction(vgaAuction)
                        .seller(seller)
                        .bidPrice(new BigDecimal("18200000"))
                        .note("Bản MSI Gaming X Slim sẵn hàng tại HCM.")
                        .isWinner(false)
                        .build());
            }
        }

        // PSU Auction (No bids yet)
        if (psuCat != null && auctionRequestRepository.findByTitle("Cần nguồn 850W 80 Plus Gold").isEmpty()) {
            auctionRequestRepository.save(AuctionRequest.builder()
                    .buyer(buyer)
                    .category(psuCat)
                    .title("Cần nguồn 850W 80 Plus Gold")
                    .description("Yêu cầu các hãng Tier A như Corsair, Seasonic, Super Flower.")
                    .quantity(1)
                    .budgetMax(new BigDecimal("3000000"))
                    .endDate(LocalDateTime.now().plusDays(4))
                    .status(AuctionStatus.OPEN)
                    .build());
        }

        // RAM Auction
        if (ramCat != null && auctionRequestRepository.findByTitle("Cần 2 kit RAM Corsair Vengeance 32GB DDR5").isEmpty()) {
            auctionRequestRepository.save(AuctionRequest.builder()
                    .buyer(buyer)
                    .category(ramCat)
                    .title("Cần 2 kit RAM Corsair Vengeance 32GB DDR5")
                    .description("Bus 6000MHz, màu đen, CL30.")
                    .quantity(2)
                    .budgetMax(new BigDecimal("3600000"))
                    .endDate(LocalDateTime.now().plusDays(10))
                    .status(AuctionStatus.OPEN)
                    .build());
        }

        System.out.println("Seeded PC component auction requests and bids.");
    }

    private void seedProducts() {
        if (productRepository.count() > 0) {
            return;
        }

        User seller = userRepository.findByEmail("seller@gmail.com").orElse(null);
        if (seller == null) {
            return;
        }

        productRepository.saveAll(List.of(
                Product.builder()
                        .name("ASUS TUF Gaming GeForce RTX 4070 SUPER")
                        .brand("ASUS")
                        .description("Card đồ họa hiệu năng cao cho gaming 2K/4K, tản nhiệt tốt, phù hợp build PC cao cấp.")
                        .imageUrl(null)
                        .stock(8)
                        .rating((byte) 5)
                        .price(new BigDecimal("18500000"))
                        .listedForSale(true)
                        .seller(seller)
                        .build(),
                Product.builder()
                        .name("Intel Core i5-13600K")
                        .brand("Intel")
                        .description("CPU 14 nhân mạnh mẽ cho gaming và làm việc đa nhiệm, hỗ trợ ép xung nhẹ.")
                        .imageUrl(null)
                        .stock(15)
                        .rating((byte) 5)
                        .price(new BigDecimal("7200000"))
                        .listedForSale(true)
                        .seller(seller)
                        .build(),
                Product.builder()
                        .name("Corsair Vengeance DDR5 32GB 6000MHz")
                        .brand("Corsair")
                        .description("Bộ RAM DDR5 tốc độ cao 32GB, tối ưu cho gaming và sáng tạo nội dung.")
                        .imageUrl(null)
                        .stock(12)
                        .rating((byte) 4)
                        .price(new BigDecimal("3600000"))
                        .listedForSale(true)
                        .seller(seller)
                        .build()
        ));

        System.out.println("Seeded seller products.");
    }
}

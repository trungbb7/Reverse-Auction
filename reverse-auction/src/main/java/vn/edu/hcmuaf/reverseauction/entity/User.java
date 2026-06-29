package vn.edu.hcmuaf.reverseauction.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;
import java.math.BigDecimal;


@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(length = 50, nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private String password;
    @Column(nullable = false)
    private String fullName;
    @Column(length = 20)
    private String phone;

    @Column
    private String address;
    @Column
    private String imageUrl;
    @Column
    private String description;


    @Column(nullable = false)
    @Builder.Default
    private Double rating = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalReviews = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AuthProvider provider = AuthProvider.LOCAL;

    @Column(nullable = false)
    @Builder.Default
    private Boolean verified = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @Column(nullable = false)
    @Builder.Default
    private Integer failedAttempts = 0;

    @Column
    private LocalDateTime lockoutTime;

    @Column(nullable = false, columnDefinition = "DECIMAL(15,2) DEFAULT 0.00")
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;


    // KYC fields
    @Column(name = "identity_number", length = 20)
    private String identityNumber;

    @Column(name = "identity_front_image")
    private String identityFrontImage;

    @Column(name = "identity_back_image")
    private String identityBackImage;

    @Column(name = "business_license")
    private String businessLicense;

    @Enumerated(EnumType.STRING)
    @Column(name = "kyc_status", nullable = false)
    @Builder.Default
    private KycStatus kycStatus = KycStatus.UNVERIFIED;

    @Column(name = "kyc_message", columnDefinition = "TEXT")
    private String kycMessage;

    @OneToMany(mappedBy = "buyer", fetch = FetchType.LAZY)
    @Builder.Default
    private List<AuctionRequest> auctionRequests = new ArrayList<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }
    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() {
        if (lockoutTime != null && lockoutTime.isAfter(LocalDateTime.now())) {
            return false;
        }
        return enabled;
    }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return enabled; }
}

package vn.edu.hcmuaf.reverseauction.service.impl;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import vn.edu.hcmuaf.reverseauction.entity.User;
import vn.edu.hcmuaf.reverseauction.service.JwtService;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtServiceImpl implements JwtService {
    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpiration;

    @Override
    public String generateToken(UserDetails userDetails) {
        var builder = Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration));

        if (userDetails instanceof User user) {
            builder.claim("id", user.getId());
            builder.claim("fullName", user.getFullName());
            builder.claim("role", user.getRole().name());
        }

        return builder.signWith(getSignInKey(), SignatureAlgorithm.HS256).compact();
    }

    @Override
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }


    @Override
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    public Long extractUserId(String token) {
        return extractClaim(token, claims -> {
            Object idVal = claims.get("id");
            if (idVal instanceof Number) {
                return ((Number) idVal).longValue();
            }
            return null;
        });
    }
    @Override
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Key getSignInKey() {
//        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

}
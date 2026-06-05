package vn.edu.hcmuaf.reverseauction.service;

public interface EmailService {
    void sendPasswordResetEmail(String toEmail, String token);
    void sendVerificationEmail(String toEmail, String token);
}

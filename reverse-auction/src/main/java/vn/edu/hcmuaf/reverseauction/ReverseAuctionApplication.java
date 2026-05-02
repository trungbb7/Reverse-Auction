package vn.edu.hcmuaf.reverseauction;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ReverseAuctionApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReverseAuctionApplication.class, args);
    }

}

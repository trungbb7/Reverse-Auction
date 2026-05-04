package vn.edu.hcmuaf.reverseauction.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.hcmuaf.reverseauction.entity.AuctionRequest;
import vn.edu.hcmuaf.reverseauction.entity.AuctionStatus;
import vn.edu.hcmuaf.reverseauction.repository.AuctionRequestRepository;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionScheduler {

    private final AuctionRequestRepository auctionRequestRepository;

    /**
     * Automatically change auction status from OPEN to CLOSED when endDate has passed
     * Run every 60 seconds.
     */
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void closeExpiredAuctions() {
        LocalDateTime now = LocalDateTime.now();
        List<AuctionRequest> expiredAuctions =
                auctionRequestRepository.findByStatusAndEndDateBefore(AuctionStatus.OPEN, now);

        if (expiredAuctions.isEmpty()) {
            return;
        }

        log.info("[Scheduler] Tìm thấy {} auction hết hạn, đang chuyển CLOSED...", expiredAuctions.size());

        for (AuctionRequest auction : expiredAuctions) {
            auction.setStatus(AuctionStatus.CLOSED);
            log.info("[Scheduler] Auction id={} '{}' → CLOSED", auction.getId(), auction.getTitle());
        }

        auctionRequestRepository.saveAll(expiredAuctions);
        log.info("[Scheduler] Đã đóng {} auction.", expiredAuctions.size());
    }
}

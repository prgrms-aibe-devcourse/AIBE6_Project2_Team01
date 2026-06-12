package com.modle.global.scheduler;

import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.UserStatus;
import com.modle.domain.user.repository.ClientRepository;
import com.modle.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RejectedUserCleanupScheduler {
    private final UserRepository userRepository;

    // 매일 새벽 2시 실행
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void deleteRejectedUsers() {
        // 반려된 지 7일 이상 지난 유저 조회
        LocalDateTime threshold = LocalDateTime.now().minusDays(7);
        List<User> targets = userRepository
                .findByStatusAndRejectedDateBefore(UserStatus.REJECTED, threshold);

        if (targets.isEmpty()) {
            log.info("[Scheduler] 삭제 대상 없음");
            return;
        }

        userRepository.deleteAll(targets);

        log.info("[Scheduler] 반려 유저 {}명 삭제 완료", targets.size());
    }
}

package com.modle.domain.user.repository;

import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByStatusAndRejectedDateBefore(UserStatus status, LocalDateTime dateTime);
}

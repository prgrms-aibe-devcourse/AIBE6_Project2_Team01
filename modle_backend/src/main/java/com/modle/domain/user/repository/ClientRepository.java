package com.modle.domain.user.repository;

import com.modle.domain.user.entity.Client;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.entity.type.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByUser_Status(UserStatus userStatus);

    Optional<Client> findByUser(User user);
}

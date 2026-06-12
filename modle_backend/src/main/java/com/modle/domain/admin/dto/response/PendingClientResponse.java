package com.modle.domain.admin.dto.response;

import com.modle.domain.user.entity.Client;
import com.modle.domain.user.entity.type.ClientType;

import java.time.LocalDateTime;

public record PendingClientResponse(
        Long userId,
        String email,
        String companyName,
        String companyNumber,
        ClientType clientType,
        String region,
        LocalDateTime createdDate
) {
    public PendingClientResponse(Client client) {
        this(
                client.getUser().getId(),
                client.getUser().getEmail(),
                client.getCompanyName(),
                client.getCompanyNumber(),
                client.getClientType(),
                client.getUser().getRegion(),
                client.getUser().getCreatedDate()
        );
    }
}

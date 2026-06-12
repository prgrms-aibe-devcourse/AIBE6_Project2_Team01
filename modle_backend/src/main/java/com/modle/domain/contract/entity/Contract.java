package com.modle.domain.contract.entity;

import com.modle.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "contracts")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Contract extends BaseEntity {

    // TODO: Application 엔티티 확정 후 Long applicationId를 @OneToOne 연관관계로 변경
    @Column(nullable = false, unique = true)
    private Long applicationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContractType contractType;

    @Column(nullable = false)
    private LocalDateTime shootStartAt;

    @Column(nullable = false)
    private LocalDateTime shootEndAt;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal payment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PayType payType;

    @Column(nullable = false, length = 500)
    private String usageScope;

    @Lob
    private String memo;

    @Column(length = 500)
    private String pdfUrl;

    @Column(length = 500)
    private String signedPdfUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ContractStatus status = ContractStatus.DRAFT;

    @Column(nullable = false)
    @Builder.Default
    private Boolean clientAgreed = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean modelAgreed = false;

    private LocalDateTime clientAgreedAt;

    private LocalDateTime modelAgreedAt;

    @Column(length = 45)
    private String clientIp;

    @Column(length = 45)
    private String modelIp;

    private LocalDateTime viewedAt;

    private LocalDateTime notifiedAt;

    private LocalDateTime confirmedAt;
}

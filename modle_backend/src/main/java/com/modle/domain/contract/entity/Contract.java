package com.modle.domain.contract.entity;

import com.modle.domain.contract.entity.type.ContractStatus;
import com.modle.domain.contract.entity.type.ContractType;
import com.modle.domain.contract.entity.type.PayType;
import com.modle.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "contracts")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Contract extends BaseEntity {

    // TODO: 매칭(Application) 도메인 구현 완료 후
    // applicationId를 @OneToOne 연관관계로 전환하고,
    // 계약 생성 시 application 존재 여부 및 공고 작성자 소유권 검증을 추가한다.
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
    private ContractStatus status = ContractStatus.DRAFT;

    @Column(nullable = false)
    private Boolean clientAgreed = false;

    @Column(nullable = false)
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

    public static Contract createDraft(
            Long applicationId,
            ContractType contractType,
            LocalDateTime shootStartAt,
            LocalDateTime shootEndAt,
            String location,
            BigDecimal payment,
            PayType payType,
            String usageScope,
            String memo,
            String pdfUrl
    ) {
        Contract contract = new Contract();
        contract.applicationId = applicationId;
        contract.contractType = contractType;
        contract.shootStartAt = shootStartAt;
        contract.shootEndAt = shootEndAt;
        contract.location = location;
        contract.payment = payment;
        contract.payType = payType;
        contract.usageScope = usageScope;
        contract.memo = memo;
        contract.pdfUrl = pdfUrl;
        contract.status = ContractStatus.DRAFT;
        contract.clientAgreed = false;
        contract.modelAgreed = false;
        return contract;
    }

    public void updatePdfUrl(String pdfUrl) {
        this.pdfUrl = pdfUrl;
    }

    public void notifyModel(LocalDateTime notifiedAt) {
        this.status = ContractStatus.NOTIFIED;
        this.notifiedAt = notifiedAt;
    }
}
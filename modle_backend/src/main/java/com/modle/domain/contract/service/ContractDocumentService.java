package com.modle.domain.contract.service;

import com.modle.domain.contract.dto.response.ContractPdfResponse;
import com.modle.domain.contract.entity.Contract;
import com.modle.domain.contract.entity.type.ContractType;
import com.modle.domain.contract.pdf.ContractPdfGenerator;
import com.modle.domain.contract.template.ContractTemplateContext;
import com.modle.domain.contract.template.ContractTemplateRenderer;
import com.modle.domain.jobposting.dto.response.JobPostingResponse;
import com.modle.domain.profile.service.ClientService;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.User;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import com.modle.global.gcs.GcsService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class ContractDocumentService {
    private final GcsService gcsService;
    private final ContractPdfGenerator contractPdfGenerator;
    private final ContractTemplateRenderer contractTemplateRenderer;
    private final ClientService clientService;

    private ContractPdfResponse handleFileContract(Contract contract) {
        if (contract.getPdfUrl() == null || contract.getPdfUrl().isBlank()) {
            throw new CustomException(ErrorCode.INVALID_FILE_CONTRACT);
        }

        return ContractPdfResponse.from(contract);
    }

    private String generateAndUploadPdf(
            Contract contract,
            JobPostingResponse jobPosting,
            User clientUser,
            Model model,
            User modelUser,
            String fileNamePrefix
    ) {
        String templateContent = loadContractTemplate();
        ContractTemplateContext context = buildTemplateContext(
                contract,
                jobPosting,
                clientUser,
                model,
                modelUser
        );
        String renderedContent = contractTemplateRenderer.render(templateContent, context);

        byte[] pdfBytes = contractPdfGenerator.generate(renderedContent);

        String objectName = "contracts/" + contract.getId() + "/"
                + fileNamePrefix + UUID.randomUUID() + ".pdf";

        return gcsService.uploadPdf(pdfBytes, objectName);
    }

    ContractPdfResponse generateDraftPdf(
            Contract contract,
            JobPostingResponse jobPosting,
            User clientUser,
            Model model,
            User modelUser
    ) {
        if (contract.getContractType() == ContractType.FILE) {
            return handleFileContract(contract);
        }

        String pdfUrl = generateAndUploadPdf(
                contract,
                jobPosting,
                clientUser,
                model,
                modelUser,
                ""
        );

        contract.updatePdfUrl(pdfUrl);
        return ContractPdfResponse.from(contract);
    }

    String generateSignedPdf(
            Contract contract,
            JobPostingResponse jobPosting,
            User clientUser,
            Model model,
            User modelUser
    ) {
        return generateAndUploadPdf(
                contract,
                jobPosting,
                clientUser,
                model,
                modelUser,
                "signed-"
        );
    }

    private String loadContractTemplate() {
        try {
            ClassPathResource resource = new ClassPathResource("templates/contract-template.html");
            return resource.getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new CustomException(ErrorCode.CONTRACT_TEMPLATE_LOAD_FAILED);
        }
    }

    private ContractTemplateContext buildTemplateContext(
            Contract contract,
            JobPostingResponse jobPosting,
            User clientUser,
            Model model,
            User modelUser
    ) {
        var client = clientService.findByUserId(clientUser.getId());

        String clientSignatureText = Boolean.TRUE.equals(contract.getClientAgreed())
                ? client.getCompanyName()
                : "";

        String clientSignedAt = contract.getClientAgreedAt() == null
                ? ""
                : contract.getClientAgreedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        String modelSignatureText = Boolean.TRUE.equals(contract.getModelAgreed())
                ? model.getName()
                : "";

        String modelSignedAt = contract.getModelAgreedAt() == null
                ? ""
                : contract.getModelAgreedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        return new ContractTemplateContext(
                client.getCompanyName(),
                clientUser.getEmail(),
                model.getName(),
                modelUser.getEmail(),
                jobPosting.content(),
                jobPosting.category() == null ? "" : jobPosting.category().name(),
                contract.getShootStartAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                contract.getShootEndAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                contract.getLocation(),
                formatContractPayment(contract),
                formatContractPayType(contract),
                contract.getUsageScope(),
                contract.getMemo(),
                clientSignatureText,
                clientSignedAt,
                modelSignatureText,
                modelSignedAt
        );
    }

    private String formatContractPayment(Contract contract) {
        if (contract.getPayType() == com.modle.domain.contract.entity.type.PayType.FREE) {
            return "0원";
        }

        return NumberFormat.getNumberInstance(Locale.KOREA).format(contract.getPayment()) + "원";
    }

    private String formatContractPayType(Contract contract) {
        return switch (contract.getPayType()) {
            case CASH -> "현금";
            case SERVICE -> "서비스";
            case FREE -> "무료";
        };
    }
}

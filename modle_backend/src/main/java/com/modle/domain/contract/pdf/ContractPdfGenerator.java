package com.modle.domain.contract.pdf;

import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;

@Component
public class ContractPdfGenerator {

    public byte[] generate(String html) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(outputStream);
            builder.useFont(
                    new ClassPathResource("fonts/Pretendard-Regular.ttf").getFile(),
                    "Pretendard"
            );
            builder.run();
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new CustomException(ErrorCode.CONTRACT_PDF_GENERATION_FAILED);
        }
    }

}

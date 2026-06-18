package com.modle.domain.contract.pdf;

import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;

@Component
public class ContractPdfGenerator {

    public byte[] generate(String html) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            ClassPathResource fontResource = new ClassPathResource("fonts/Pretendard-Regular.ttf");
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(outputStream);
            builder.useFont(
                    () -> {
                        try {
                            return fontResource.getInputStream();
                        } catch (IOException e) {
                            throw new UncheckedIOException(e);
                        }
                    },
                    "Pretendard"
            );
            builder.run();
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new CustomException(ErrorCode.CONTRACT_PDF_GENERATION_FAILED);
        }
    }

}

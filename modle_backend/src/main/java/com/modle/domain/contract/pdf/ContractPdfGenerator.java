package com.modle.domain.contract.pdf;

import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

@Component
public class ContractPdfGenerator {

    public byte[] generate(String content) {
        try (
                PDDocument document = new PDDocument();
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ) {
            PDPage pdPage = new PDPage(PDRectangle.A4);
            document.addPage(pdPage);

            PDType0Font font = loadFont(document);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, pdPage)) {
                contentStream.beginText();
                contentStream.setFont(font, 12);
                contentStream.setLeading(18f);
                contentStream.newLineAtOffset(50, 780);

                for (String line : content.split("\\R")) {
                    contentStream.showText(line);
                    contentStream.newLine();
                }

                contentStream.endText();
            }

            document.save(outputStream);
            return outputStream.toByteArray();
        } catch (IOException e) {
            throw new CustomException(ErrorCode.CONTRACT_PDF_GENERATION_FAILED);
        }

    }

    private PDType0Font loadFont(PDDocument document) throws IOException {
        try (InputStream inputStream = new ClassPathResource("fonts/Pretendard-Regular.ttf").getInputStream()) {
            return PDType0Font.load(document, inputStream);
        }
    }
}

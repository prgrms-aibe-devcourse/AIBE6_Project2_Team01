package com.modle.global.gcs;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GcsService {
    private final Storage storage;
    @Value("${gcs.bucket}")
    private String bucketName;

    public String uploadImage(MultipartFile file) throws IOException {
        // 1. 파일 이름이 겹치지 않게 고유한 랜덤 이름(UUID) 생성
        String uuid = UUID.randomUUID().toString();
        String contentType = file.getContentType(); // 예: image/png

        // 2. GCS에 저장할 파일 메타정보 세팅
        BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, uuid)
                .setContentType(contentType)
                .build();
        // 3. GCS로 실제 파일 데이터 전송
        storage.create(blobInfo, file.getBytes());
        // 4. 저장된 이미지를 외부에서 볼 수 있는 구글 스토리지 URL 조합해서 반환
        return "https://storage.googleapis.com/" + bucketName + "/" + uuid;
    }

    public void deleteImage(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;

        try {
            // URL에서 마지막 파일명(UUID)만 추출 (예: https://.../modle_bucket/uuid -> uuid)
            String objectName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

            // GCS 버킷에서 파일 삭제
            BlobId blobId = BlobId.of(bucketName, objectName);
            storage.delete(blobId);
        } catch (Exception e) {
            // 삭제 실패 시 에러 로깅 (메인 로직에 지장을 주지 않도록 예외 처리)
            System.err.println("GCS 이미지 삭제 실패: " + e.getMessage());
        }
    }

    public String uploadPdf(byte[] fileBytes, String objectName) {
        BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, objectName)
                .setContentType("application/pdf")
                .build();

        storage.create(blobInfo, fileBytes);

        return "https://storage.googleapis.com/" + bucketName + "/" + objectName;
    }
}

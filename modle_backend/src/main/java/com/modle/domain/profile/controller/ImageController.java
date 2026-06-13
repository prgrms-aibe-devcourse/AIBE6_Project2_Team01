package com.modle.domain.profile.controller;

import com.modle.global.gcs.GcsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/images")
@RequiredArgsConstructor
public class ImageController {
    private final GcsService gcsService;
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // 프론트엔드가 보낸 파일을 서비스에 넘겨서 GCS에 올리기
            String imageUrl = gcsService.uploadImage(file);

            // 성공하면 {"imageUrl": "https://storage..."} 형태로 응답
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (IOException e) {
            // 실패 시 500 에러를 뱉습니다.
            return ResponseEntity.internalServerError().build();
        }
    }
}

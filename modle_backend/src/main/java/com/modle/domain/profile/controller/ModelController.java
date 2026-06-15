package com.modle.domain.profile.controller;

import com.modle.domain.profile.dto.ModelDto;
import com.modle.domain.profile.dto.request.ModelModifyReqBody;
import com.modle.domain.profile.entity.type.Category;
import com.modle.domain.profile.service.ModelService;
import com.modle.domain.user.entity.Model;
import com.modle.global.auth.SecurityUser;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import com.modle.global.gcs.GcsService;
import com.modle.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // @Controller + @ResponseBody
@RequestMapping("/api/v1/models")
@RequiredArgsConstructor
@Tag(name = "ModelController", description = "API Model 컨트롤러")
public class ModelController {
        private final ModelService modelService;
        private final GcsService gcsService;

        @Transactional(readOnly = true)
        @GetMapping
        @Operation(summary = "다건 조회 및 필터링")
        public ApiResponse<List<ModelDto>> getItems(
                @RequestParam(required = false) String query,
                @RequestParam(required = false) String gender,
                @RequestParam(required = false) List<Category> categories,
                @RequestParam(required = false) List<String> regions, // 지역 파라미터 추가
                @RequestParam(required = false) List<String> tags
        ) {
                // 성별 파라미터 처리
                Boolean genderParam = null;
                if ("MALE".equalsIgnoreCase(gender)) {
                        genderParam = true;
                } else if ("FEMALE".equalsIgnoreCase(gender)) {
                        genderParam = false;
                }
                // Service 호출
                List<Model> items = modelService.getList(query, genderParam, categories, regions, tags);
                // DTO 변환
                List<ModelDto> dtoList = items.stream().map(ModelDto::new).toList();
                return new ApiResponse<>("200-1", "조회 성공", dtoList);
        }

        @Transactional(readOnly = true)
        @GetMapping("/{id}")
        @Operation(summary = "단건 조회")
        public ApiResponse<ModelDto> getItem(@PathVariable Long id) {
                Model item = modelService.findById(id);

                return new ApiResponse<>(
                                "200-1",
                                "조회 성공",
                                new ModelDto(item));
        }

        @Transactional(readOnly = true)
        @GetMapping("/my")
        @Operation(summary = "내 프로필 단건 조회")
        public ApiResponse<ModelDto> getMyItem(@AuthenticationPrincipal SecurityUser currentUser) {

                Model item;
                if (currentUser == null) {
                        throw new RuntimeException("로그인한 유저만 가능합니다.");
                } else {
                        item = modelService.findByUserId(currentUser.getId());
                }

                return new ApiResponse<>(
                                "200-1",
                                "조회 성공",
                                new ModelDto(item));

        }

        @PutMapping("/my")
        @Transactional
        @Operation(summary = "내 프로필 수정")
        public ApiResponse<Void> modifyMyItem(
                        @Valid @RequestBody ModelModifyReqBody reqBody,
                        @AuthenticationPrincipal SecurityUser currentUser) {
                Model model;
                model = modelService.findByUserId(currentUser.getId());
                // 기존 이미지 URL과 새로 들어온 이미지 URL 비교
                String oldImageUrl = model.getProfileImageUrl();
                String newImageUrl = reqBody.profileImageUrl();

                // 새 이미지로 변경되었거나, 프로필 이미지를 삭제(null)한 경우 기존 GCS 파일 삭제
                if (oldImageUrl != null && !oldImageUrl.equals(newImageUrl)) {
                        gcsService.deleteImage(oldImageUrl);
                }
                modelService.update(
                                model,
                                reqBody.name(),
                                reqBody.height(),
                                reqBody.weight(),
                                reqBody.gender(),
                                reqBody.age(),
                                reqBody.categories(),
                                reqBody.tags(),
                                reqBody.introduction(),
                                reqBody.region(),
                                newImageUrl);
                return new ApiResponse<>(
                                "200-1",
                                "내 프로필이 수정되었습니다.");
        }

        @DeleteMapping("/{id}")
        @Transactional
        @Operation(summary = "삭제")
        public ApiResponse<ModelDto> delete(
                        @PathVariable Long id,
                        @AuthenticationPrincipal SecurityUser currentUser) {
                Model model = modelService.findById(id);

                // 권한 검증: 현재 로그인한 사용자가 이 모델 프로필의 소유자인지 확인
                if (currentUser == null || !model.getUser().getId().equals(currentUser.getId())) {
                        throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
                }

                modelService.delete(model);

                return new ApiResponse<>(
                                "200-1",
                                "%d번 모델 프로필이 삭제되었습니다.".formatted(id),
                                new ModelDto(model));
        }
}

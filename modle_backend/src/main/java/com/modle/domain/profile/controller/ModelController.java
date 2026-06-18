package com.modle.domain.profile.controller;

import com.modle.domain.profile.dto.ModelDto;
import com.modle.domain.profile.dto.request.ModelModifyReqBody;
import com.modle.domain.profile.entity.type.Category;
import com.modle.domain.profile.service.ModelService;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.type.Sex;
import com.modle.global.auth.SecurityUser;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import com.modle.global.gcs.GcsService;
import com.modle.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
        public ApiResponse<Page<ModelDto>> getItems(
                @RequestParam(required = false) String query,
                @RequestParam(required = false) String gender,
                @RequestParam(required = false) List<Category> categories,
                @RequestParam(required = false) List<String> regions,
                @RequestParam(required = false) List<String> tags,
                @RequestParam(required = false) String height,
                @RequestParam(required = false) String sort,
                @RequestParam(defaultValue = "0") int page, // 추가 (첫 페이지는 0)
                @RequestParam(defaultValue = "12") int size // 추가 (한 번에 12개씩)
        ) {
                // 성별 파라미터 처리
                Sex sexParam = null;
                if ("M".equalsIgnoreCase(gender) || "MALE".equalsIgnoreCase(gender)) {
                        sexParam = Sex.M;
                } else if ("F".equalsIgnoreCase(gender) || "FEMALE".equalsIgnoreCase(gender)) {
                        sexParam = Sex.F;
                }
                Page<Model> items = modelService.getList(query, sexParam, categories, regions, tags, height, sort, page, size);

                // Page 객체에 내장된 map을 사용해 Entity -> Dto로 자동 변환
                Page<ModelDto> dtoList = items.map(ModelDto::new);
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
                                reqBody.sex(),
                                reqBody.age(),
                                reqBody.categories(),
                                reqBody.tags(),
                                reqBody.introduction(),
                                reqBody.region(),
                                newImageUrl,
                                reqBody.careerStartDate(),
                                reqBody.activeRegions());
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

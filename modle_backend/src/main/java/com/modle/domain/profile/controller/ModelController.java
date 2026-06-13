package com.modle.domain.profile.controller;

import com.modle.domain.profile.dto.ModelDto;
import com.modle.domain.profile.dto.request.ModelCreateReqBody;
import com.modle.domain.profile.dto.request.ModelModifyReqBody;
import com.modle.domain.profile.service.ModelService;
import com.modle.domain.user.entity.Model;
import com.modle.global.auth.SecurityUser;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import com.modle.global.rsData.RsData;
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
@Tag(name = "ModelController", description = "API 모델 컨트롤러")
public class ModelController {
        private final ModelService modelService;

        @Transactional(readOnly = true)
        @GetMapping
        @Operation(summary = "다건 조회")
        public List<ModelDto> getItems() {
                List<Model> items = modelService.getList();
                return items
                                .stream()
                                .map(ModelDto::new) // modelDto 변환
                                .toList();
        }

        @Transactional(readOnly = true)
        @GetMapping("/{id}")
        @Operation(summary = "단건 조회")
        public RsData<ModelDto> getItem(@PathVariable Long id) {
                Model item = modelService.findById(id);

                return new RsData<>(
                                "200-1",
                                "조회 성공",
                                new ModelDto(item));
        }

        @Transactional(readOnly = true)
        @GetMapping("/my")
        @Operation(summary = "내 프로필 단건 조회")
        public RsData<ModelDto> getMyItem(@AuthenticationPrincipal SecurityUser currentUser) {
                Model item;
                if (currentUser == null) {
                        item = modelService.findByUserId(9L); // 개발 환경 임시 하드코딩
                } else {
                        item = modelService.findByUserId(currentUser.getId());
                }

                return new RsData<>(
                                "200-1",
                                "조회 성공",
                                new ModelDto(item));
        }

        @PutMapping("/my")
        @Transactional
        @Operation(summary = "내 프로필 수정")
        public RsData<Void> modifyMyItem(
                        @Valid @RequestBody ModelModifyReqBody reqBody,
                        @AuthenticationPrincipal SecurityUser currentUser) {
                Model model;
                if (currentUser == null) {
                        model = modelService.findByUserId(9L); // 개발 환경 임시 하드코딩
                } else {
                        model = modelService.findByUserId(currentUser.getId());
                }

                modelService.update(
                                model,
                                reqBody.name(),
                                reqBody.height(),
                                reqBody.weight(),
                                reqBody.gender(),
                                reqBody.age(),
                                reqBody.field(),
                                reqBody.tags(),
                                reqBody.introduction(),
                                reqBody.profileImageUrl());

                return new RsData<>(
                                "200-1",
                                "내 프로필이 수정되었습니다.");
        }

        @PostMapping
        @Transactional
        @Operation(summary = "모델 프로필 생성")
        public RsData<ModelDto> create(
                        @Valid // 유효성 검사
                        @RequestBody ModelCreateReqBody reqBody,
                        @AuthenticationPrincipal SecurityUser currentUser) {

                Model model = modelService.create(
                                null, // TODO: Resolve User from Security Context or request (needs UserRepository)
                                reqBody.name(),
                                reqBody.height(),
                                reqBody.weight(),
                                reqBody.gender(),
                                reqBody.age());

                // Update optional fields
                modelService.update(
                                model,
                                reqBody.name(),
                                reqBody.height(),
                                reqBody.weight(),
                                reqBody.gender(),
                                reqBody.age(),
                                reqBody.field(),
                                reqBody.tags(),
                                reqBody.introduction(),
                                reqBody.profileImageUrl());

                return new RsData<>(
                                "201-1",
                                "모델 프로필이 생성되었습니다.",
                                new ModelDto(model));
        }

        // @PutMapping("/{id}")
        // @Transactional
        // @Operation(summary = "수정")
        // public RsData<Void> modify(
        // @PathVariable long id,
        // @Valid @RequestBody ModelModifyReqBody reqBody,
        // @AuthenticationPrincipal SecurityUser currentUser
        // ) {
        //
        // Model model = modelService.findById(id);
        //
        // // 권한 검증: 현재 로그인한 사용자가 이 모델 프로필의 소유자인지 확인
        // if (currentUser == null ||
        // !model.getUser().getId().equals(currentUser.getId())) {
        // throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        // }
        //
        // modelService.update(
        // model,
        // reqBody.name(),
        // reqBody.height(),
        // reqBody.weight(),
        // reqBody.gender(),
        // reqBody.age(),
        // reqBody.field(),
        // reqBody.tags(),
        // reqBody.introduction(),
        // reqBody.profileImageUrl()
        // );
        //
        // return new RsData<>(
        // "200-1",
        // "%d번 게시글이 수정되었습니다.".formatted(id)
        // );
        // }
        @DeleteMapping("/{id}")
        @Transactional
        @Operation(summary = "삭제")
        public RsData<ModelDto> delete(
                        @PathVariable Long id,
                        @AuthenticationPrincipal SecurityUser currentUser) {
                Model model = modelService.findById(id);

                // 권한 검증: 현재 로그인한 사용자가 이 모델 프로필의 소유자인지 확인
                if (currentUser == null || !model.getUser().getId().equals(currentUser.getId())) {
                        throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
                }

                modelService.delete(model);

                return new RsData<>(
                                "200-1",
                                "%d번 모델 프로필이 삭제되었습니다.".formatted(id),
                                new ModelDto(model));
        }
}

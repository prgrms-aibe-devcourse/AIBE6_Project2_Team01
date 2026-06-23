package com.modle.domain.profile.controller;

import com.modle.domain.jobposting.dto.response.MyJobPostingResponse;
import com.modle.domain.jobposting.service.JobPostingService;
import com.modle.domain.profile.dto.ClientDto;
import com.modle.domain.profile.dto.request.ClientModifyReqBody;
import com.modle.domain.profile.service.ClientService;
import com.modle.domain.user.entity.Client;
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

@RestController
@RequestMapping("/api/v1/clients")
@RequiredArgsConstructor
@Tag(name = "의뢰인", description = "의뢰인 프로필 조회·수정 API")
public class ClientController {
    private final ClientService clientService;
    private final GcsService gcsService;
    private final JobPostingService jobPostingService;

    @Transactional(readOnly = true)
    @GetMapping
    @Operation(summary = "다건 조회")
    public ApiResponse<List<ClientDto>> getItems() {

        List<Client> items = clientService.getList();

        List<ClientDto> dtoList = items
                .stream()
                .map(ClientDto::new) // modelDto 변환
                .toList();
        return new ApiResponse<List<ClientDto>>(
                "200-1",
                "조회 성공",
                dtoList);
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}")
    @Operation(summary = "단건 조회")
    public ApiResponse<ClientDto> getItem(@PathVariable Long id) {
        Client item = clientService.findById(id);

        return new ApiResponse<>(
                "200-1",
                "조회 성공",
                new ClientDto(item));
    }

    @Transactional(readOnly = true)
    @GetMapping("/my")
    @Operation(summary = "내 프로필 단건 조회")
    public ApiResponse<ClientDto> getMyItem(@AuthenticationPrincipal SecurityUser currentUser) {

        Client item;
        if (currentUser == null) {
            throw new RuntimeException("로그인한 유저만 가능합니다.");
        } else {
            item = clientService.findByUserId(currentUser.getId());
        }

        return new ApiResponse<>(
                "200-1",
                "조회 성공",
                new ClientDto(item));
    }

    @Transactional(readOnly = true)
    @GetMapping("/{id}/job-postings")
    @Operation(summary = "의뢰인 공개 공고 목록 조회 (상태 필터 선택)")
    public ApiResponse<List<MyJobPostingResponse>> getClientJobPostings(
            @PathVariable Long id,
            @RequestParam(required = false) String status) {
        Client client = clientService.findById(id);
        Long clientUserId = client.getUser().getId();

        return new ApiResponse<>(
                "200-1",
                "의뢰인 공고 목록 조회 성공",
                jobPostingService.getClientJobPostings(clientUserId, status));
    }

    @PutMapping("/my")
    @Transactional
    @Operation(summary = "내 프로필 수정")
    public ApiResponse<Void> modifyMyItem(
            @Valid @RequestBody ClientModifyReqBody reqBody,
            @AuthenticationPrincipal SecurityUser currentUser) {
        Client client;
        client = clientService.findByUserId(currentUser.getId());
        // 기존 이미지 URL과 새로 들어온 이미지 URL 비교
        String oldImageUrl = client.getProfileImageUrl();
        String newImageUrl = reqBody.profileImageUrl();

        // 새 이미지로 변경되었거나, 프로필 이미지를 삭제(null)한 경우 기존 GCS 파일 삭제
        if (oldImageUrl != null && !oldImageUrl.equals(newImageUrl)) {
            gcsService.deleteImage(oldImageUrl);
        }
        clientService.update(
                client,
                reqBody.companyName(),
                reqBody.clientType(),
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
    public ApiResponse<ClientDto> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal SecurityUser currentUser) {
        Client client = clientService.findById(id);

        // 권한 검증: 현재 로그인한 사용자가 이 client 프로필의 소유자인지 확인
        if (currentUser == null || !client.getUser().getId().equals(currentUser.getId())) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        clientService.delete(client);

        return new ApiResponse<>(
                "200-1",
                "%d번 모델 프로필이 삭제되었습니다.".formatted(id),
                new ClientDto(client));
    }
}

package com.modle.domain.profile.controller;

import com.modle.domain.profile.dto.ModelDto;
import com.modle.domain.profile.dto.request.ModelCreateReqBody;
import com.modle.domain.profile.dto.request.ModelModifyReqBody;
import com.modle.domain.profile.entity.Model;
import com.modle.domain.profile.service.ModelService;
import com.modle.global.rsData.RsData;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController//@Controller + @ResponseBody
@RequestMapping("/api/v1/models")
@RequiredArgsConstructor
@Tag(name="ModelController", description = "API 모델 컨트롤러")
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
    public ModelDto getItem(@PathVariable Long id) {
        Model item = modelService.findById(id);

        return new ModelDto(item);
    }
    @PostMapping
    @Transactional
    @Operation(summary = "모델 프로필 생성")
    public RsData<ModelDto> create(
            @Valid // 유효성 검사
            @RequestBody ModelCreateReqBody reqBody
    ) {

        Model model = modelService.create(
                reqBody.name(),
                reqBody.region(),
                reqBody.age(),
                reqBody.height(),
                reqBody.weight(),
                reqBody.introduction(),
                reqBody.profile_image_url(),
                reqBody.avg_rating(),
                reqBody.review_count(),
                reqBody.user_id()
                );

        return new RsData<>(
                "201-1",
                "모델 프로필이 생성되었습니다.",
                new ModelDto(model)
        );
    }
    @PutMapping("/{id}")
    @Transactional
    @Operation(summary = "수정")
    public RsData<Void> modify(
            @PathVariable long id,
            @Valid @RequestBody ModelModifyReqBody reqBody
    ) {

        Model model = modelService.findById(id);
        modelService.update(
                model,
                reqBody.region(),
                reqBody.age(),
                reqBody.height(),
                reqBody.weight(),
                reqBody.introduction(),
                reqBody.profile_image_url(),
                reqBody.avg_rating(),
                reqBody.review_count(),
                reqBody.user_id()

                );

        return new RsData<>(
                "200-1",
                "%d번 게시글이 수정되었습니다.".formatted(id)
        );
    }
    @DeleteMapping("/{id}")
    @Transactional
    @Operation(summary = "삭제")
    public RsData<ModelDto> delete(
            @PathVariable Long id
    ) {
        Model model = modelService.findById(id);

        modelService.delete(model);

        return new RsData<>(
                "200-1",
                "%d번 모델 프로필이 삭제되었습니다.".formatted(id),
                new ModelDto(model)
        );
    }
}

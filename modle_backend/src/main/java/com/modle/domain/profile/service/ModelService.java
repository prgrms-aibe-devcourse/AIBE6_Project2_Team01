package com.modle.domain.profile.service;

import com.modle.domain.profile.entity.Model;
import com.modle.domain.profile.repository.ModelRepository;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ModelService {
    private final ModelRepository modelRepository;

    public List<Model> getList() {
        return modelRepository.findAll();
    }

    public Model findById(Long id) {
        return modelRepository.findById(id).get();
    }
    public Model create(
            String name,
            int age,
            int height,
            int weight,
            String introduction,
            String profile_image_url,
            double avg_rating,
            int review_count,
            int user_id
    ){
        Model model = new Model(
                name,
                age,
                height,
                weight,
                introduction,
                profile_image_url,
                avg_rating,
                review_count,
                user_id
        );
        return modelRepository.save(model);
    }

    public void update(
            Model model,
            @NotBlank int age,
            @NotBlank int height,
            @NotBlank int weight,
            String introduction,
            String profile_image_url,
            double avg_rating,
            int review_count,
            int user_id) {
        model.modify(age, height, weight, introduction,
                profile_image_url, avg_rating, review_count, user_id);
    }

    public void delete(Model model) {
        modelRepository.delete(model);
    }
}


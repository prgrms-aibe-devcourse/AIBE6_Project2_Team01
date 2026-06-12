package com.modle.domain.profile.service;

import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.User;
import com.modle.domain.user.repository.ModelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class ModelService {
    private final ModelRepository modelRepository;

    public long count(){
        return modelRepository.count();
    }

    public List<Model> getList() {
        return modelRepository.findAll();
    }

    public Model findById(Long id) {
        return modelRepository.findById(id).get();
    }

    public Model findByUserId(Long userId) {
        return modelRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저의 모델 프로필이 존재하지 않습니다."));
    }

    public Model create(
            User user, String name, int height,
            int weight, boolean gender, int age
    ){
        Model model = Model.create(user, name, height, weight, gender, age);
        return modelRepository.save(model);
    }

    public void update(
            Model model,
            String name,
            int height,
            int weight,
            boolean gender,
            int age,
            String field,
            String tags,
            String introduction,
            String profileImageUrl) {
        model.update(name, height, weight, gender, age, field, tags, introduction, profileImageUrl);
    }

    public void delete(Model model) {
        modelRepository.delete(model);
    }
}


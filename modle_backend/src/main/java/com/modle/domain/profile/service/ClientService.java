package com.modle.domain.profile.service;

import com.modle.domain.user.entity.Client;
import com.modle.domain.user.entity.type.ClientType;
import com.modle.domain.user.repository.ClientRepository;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientService {
    private  final ClientRepository clientRepository;

    public  List<Client> getList() {
        return clientRepository.findAll();
    }
    public Client findById(Long id) {
        return clientRepository.findById(id).get();
    }

    public Client findByUserId(Long userId) {
        return clientRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저의 모델 프로필이 존재하지 않습니다."));
    }


    public void delete(Client client) {
        clientRepository.delete(client);
    }

    public void update(Client client, @NotBlank @Size(min = 2, max = 100) String componyName, ClientType clientType, String introduction,String region,String newImageUrl) {
    }
}

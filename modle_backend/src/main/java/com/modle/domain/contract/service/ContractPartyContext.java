package com.modle.domain.contract.service;

import com.modle.domain.application.entity.Application;
import com.modle.domain.jobposting.dto.response.JobPostingResponse;
import com.modle.domain.user.entity.Model;
import com.modle.domain.user.entity.User;

record ContractPartyContext(
        Application application,
        JobPostingResponse jobPosting,
        User clientUser,
        Model model,
        User modelUser
) {
}
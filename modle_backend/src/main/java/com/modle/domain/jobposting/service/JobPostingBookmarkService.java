package com.modle.domain.jobposting.service;

import com.modle.domain.jobposting.dto.response.JobPostingBookmarkResponse;
import com.modle.domain.jobposting.entity.JobPosting;
import com.modle.domain.jobposting.entity.JobPostingBookmark;
import com.modle.domain.jobposting.repository.JobPostingBookmarkRepository;
import com.modle.domain.jobposting.repository.JobPostingRepository;
import com.modle.global.exception.CustomException;
import com.modle.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobPostingBookmarkService {
    private final JobPostingBookmarkRepository bookmarkRepository;
    private JobPostingRepository jobPostingRepository;

    // 북마크 추가
    @Transactional
    public boolean add(Long modelId, Long jobPostingId) {
        // 공고 존재 여부 확인
        jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new CustomException(ErrorCode.JOB_POSTING_NOT_FOUND));

        // 이미 북마크된 경우
        if (bookmarkRepository.existsByModelIdAndJobPostingId(modelId, jobPostingId)) {
            return true;
        }

        bookmarkRepository.save(JobPostingBookmark.create(modelId, jobPostingId));
        return true;
    }

    // 북마크 삭제
    @Transactional
    public boolean remove(Long modelId, Long jobPostingId) {
        bookmarkRepository.findByModelIdAndJobPostingId(modelId, jobPostingId)
                .ifPresent(bookmarkRepository::delete);
        return false;
    }

    // 내 북마크 목록
    public List<JobPostingBookmarkResponse> getMyBookmarks(Long modelId) {
        List<JobPostingBookmark> bookmarks =
                bookmarkRepository.findByModelIdOrderByCreatedDateDesc(modelId);

        // 북마크된 공고 id 목록으로 공고 한 번에 조회
        List<Long> jobPostingIds = bookmarks.stream()
                .map(JobPostingBookmark::getJobPostingId)
                .toList();

        Map<Long, JobPosting> jobPostingMap = jobPostingRepository.findAllById(jobPostingIds)
                .stream()
                .collect(Collectors.toMap(JobPosting::getId, Function.identity()));

        return bookmarks.stream()
                .filter(b -> jobPostingMap.containsKey(b.getJobPostingId()))
                .map(b -> JobPostingBookmarkResponse.from(b, jobPostingMap.get(b.getJobPostingId())))
                .toList();
    }

    // 북마크 여부 확인
    public boolean isBookmarked(Long modelId, Long jobPostingId) {
        return bookmarkRepository.existsByModelIdAndJobPostingId(modelId, jobPostingId);
    }
}

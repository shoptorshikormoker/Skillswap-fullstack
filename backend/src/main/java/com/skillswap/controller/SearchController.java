package com.skillswap.controller;

import com.skillswap.dto.SearchResultResponse;
import com.skillswap.service.SearchService;
import java.security.Principal;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public List<SearchResultResponse> searchSkillPartners(
            @RequestParam(required = false)
            String skill,
            @RequestParam(required = false)
            Long categoryId,
            Principal principal) {
        String currentUserEmail = principal == null ? null : principal.getName();
        return searchService.searchSkillPartners(skill, categoryId, currentUserEmail);
    }
}

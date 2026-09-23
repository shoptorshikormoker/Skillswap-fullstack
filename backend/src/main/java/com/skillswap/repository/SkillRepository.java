package com.skillswap.repository;

import com.skillswap.entity.Skill;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    List<Skill> findAllByOrderByNameAsc();

    Optional<Skill> findByNameIgnoreCase(String name);
}

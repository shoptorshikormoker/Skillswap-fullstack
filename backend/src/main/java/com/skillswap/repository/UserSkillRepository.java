package com.skillswap.repository;

import com.skillswap.entity.UserSkill;
import com.skillswap.enums.SkillType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {

    List<UserSkill> findByUserIdOrderBySkillNameAsc(Long userId);

    boolean existsByUserIdAndSkillIdAndSkillType(Long userId, Long skillId, SkillType skillType);

    boolean existsByUserIdAndSkillIdAndSkillTypeAndIdNot(Long userId, Long skillId, SkillType skillType, Long id);
}

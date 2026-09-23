package com.skillswap.repository;

import com.skillswap.entity.UserSkill;
import com.skillswap.enums.SkillType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {

    List<UserSkill> findByUserIdOrderBySkillNameAsc(Long userId);

    boolean existsByUserIdAndSkillIdAndSkillType(Long userId, Long skillId, SkillType skillType);

    boolean existsByUserIdAndSkillIdAndSkillTypeAndIdNot(Long userId, Long skillId, SkillType skillType, Long id);

    @Query("""
            select us from UserSkill us
            join fetch us.user user
            join fetch us.skill skill
            join fetch skill.category category
            where us.skillType = :skillType
              and (:skillName is null or lower(skill.name) like lower(concat('%', :skillName, '%')))
              and (:categoryId is null or category.id = :categoryId)
            order by user.name asc, skill.name asc
            """)
    List<UserSkill> searchBySkillAndCategory(
            @Param("skillType")
            SkillType skillType,
            @Param("skillName")
            String skillName,
            @Param("categoryId") Long categoryId);
}

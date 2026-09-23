package com.skillswap.config;

import com.skillswap.entity.Category;
import com.skillswap.entity.Skill;
import com.skillswap.repository.CategoryRepository;
import com.skillswap.repository.SkillRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class StarterDataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final SkillRepository skillRepository;

    public StarterDataInitializer(CategoryRepository categoryRepository, SkillRepository skillRepository) {
        this.categoryRepository = categoryRepository;
        this.skillRepository = skillRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        addCategory(
                "Technology",
                "Programming, software, and digital tools.",
                List.of("Java", "Web Development", "UI/UX Design"));
        addCategory(
                "Languages",
                "Spoken and written communication skills.",
                List.of("English", "Bengali", "Public Speaking"));
        addCategory(
                "Creative",
                "Visual, artistic, and creative skills.",
                List.of("Graphic Design", "Photography", "Video Editing"));
        addCategory(
                "Business",
                "Career, marketing, and business skills.",
                List.of("Digital Marketing", "Entrepreneurship", "Presentation Skills"));
    }

    private void addCategory(String name, String description, List<String> skillNames) {
        Category category = categoryRepository.findByNameIgnoreCase(name).orElseGet(() -> {
            Category newCategory = new Category();
            newCategory.setName(name);
            newCategory.setDescription(description);
            return categoryRepository.save(newCategory);
        });

        for (String skillName : skillNames) {
            if (skillRepository.findByNameIgnoreCase(skillName).isEmpty()) {
                Skill skill = new Skill();
                skill.setName(skillName);
                skill.setDescription("Learn or teach " + skillName + " with another SkillSwap member.");
                skill.setCategory(category);
                skillRepository.save(skill);
            }
        }
    }
}

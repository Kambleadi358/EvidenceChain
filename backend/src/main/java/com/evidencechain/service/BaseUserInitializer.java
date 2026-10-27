package com.evidencechain.service;

import com.evidencechain.model.Role;
import com.evidencechain.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class BaseUserInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(BaseUserInitializer.class);

    private final UserRepository userRepository;
    private final UserService userService;
    private final JdbcTemplate jdbcTemplate;

    public BaseUserInitializer(UserRepository userRepository, UserService userService, JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        // ---------------------------------------------------------------
        // STARTUP CLEANUP: migrate any legacy FEDERAL users to POLICE role
        // so existing ./data databases remain valid after role removal.
        // Uses raw JDBC to bypass JPA enum check constraints.
        // ---------------------------------------------------------------
        migrateFederalUsers();

        // Primary demo accounts (simple usernames for college demonstration)
        seedUserIfMissing("police", "Password123!", "police@evidencechain.gov",
                "Police Officer", Role.POLICE, "Forensics Unit", "Metropolitan Police", "POL-101");

        seedUserIfMissing("judge", "Password123!", "judge@evidencechain.gov",
                "Judge", Role.JUDGE, "Special Cyber Bench", "District Judiciary Court", "JDG-201");

        seedUserIfMissing("admin", "AdminPassword123!", "admin@evidencechain.gov",
                "System Administrator", Role.ADMIN, "IT & Infrastructure Security", "EvidenceChain HQ", "ADM-001");

        // Backwards-compatibility accounts kept for existing test data and custody logs
        seedUserIfMissing("officer_chen", "Password123!", "chen@metropolice.gov",
                "Inspector David Chen", Role.POLICE, "Cybercrime Division", "Metropolitan Police", "MP-8491");

        seedUserIfMissing("judge_vance", "Password123!", "vance@judiciary.gov",
                "Hon. Judge Raymond Vance", Role.JUDGE, "Cyber Appellate Bench", "District High Court", "JD-102");

        logger.info("Base users initialized successfully (police, judge, admin, officer_chen, judge_vance).");
    }

    /**
     * Migrates any user whose role is stored as the legacy "FEDERAL" string to POLICE.
     * This handles existing ./data H2 databases created before the role was removed.
     * Uses direct JDBC (not JPA) to bypass Hibernate enum check constraints.
     * Safe to run on every startup – is a no-op when no such users exist.
     */
    private void migrateFederalUsers() {
        try {
            // Disable constraint checking temporarily for H2 compatibility,
            // then re-enable it. Silently no-ops if this syntax is unsupported.
            jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY FALSE");
            int migrated = jdbcTemplate.update(
                    "UPDATE users SET role = 'POLICE' WHERE CAST(role AS VARCHAR) = 'FEDERAL'");
            jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY TRUE");
            if (migrated > 0) {
                logger.warn("Migrated {} legacy FEDERAL user(s) to POLICE role.", migrated);
            }
        } catch (Exception e) {
            logger.debug("Federal user migration skipped (fresh database or constraint issue): {}", e.getMessage());
        }
    }

    private void seedUserIfMissing(String username, String password, String email, String fullName,
                                   Role role, String department, String agency, String badgeNumber) {
        if (!userRepository.existsByUsername(username)) {
            userService.createUser(username, password, email, fullName, role, department, agency, badgeNumber);
            logger.info("Created base user: {} with role: {}", username, role);
        }
    }
}

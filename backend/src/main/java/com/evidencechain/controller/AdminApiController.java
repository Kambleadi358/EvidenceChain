package com.evidencechain.controller;

import com.evidencechain.ai.AnomalyDetectionService;
import com.evidencechain.dto.UserDto;
import com.evidencechain.model.*;
import com.evidencechain.repository.CustodyLogRepository;
import com.evidencechain.repository.UserRepository;
import com.evidencechain.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminApiController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final CustodyLogRepository custodyLogRepository;
    private final AnomalyDetectionService anomalyDetectionService;

    public AdminApiController(UserService userService,
                              UserRepository userRepository,
                              CustodyLogRepository custodyLogRepository,
                              AnomalyDetectionService anomalyDetectionService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.custodyLogRepository = custodyLogRepository;
        this.anomalyDetectionService = anomalyDetectionService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/users/{userId}/lock")
    public ResponseEntity<?> lockUser(@PathVariable Long userId) {
        userService.lockUser(userId);
        return ResponseEntity.ok(Map.of("message", "User account locked successfully", "userId", userId));
    }

    @PostMapping("/users/{userId}/unlock")
    public ResponseEntity<?> unlockUser(@PathVariable Long userId) {
        userService.unlockUser(userId);
        return ResponseEntity.ok(Map.of("message", "User account unlocked successfully", "userId", userId));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        String roleStr = body.get("role");
        if (roleStr == null) {
            throw new IllegalArgumentException("Role field is required");
        }
        Role role = Role.valueOf(roleStr.toUpperCase());
        userService.updateUserRole(userId, role);
        return ResponseEntity.ok(Map.of("message", "User role updated to " + role.name(), "userId", userId));
    }

    /**
     * ADMIN-only "Simulate attack" endpoint:
     * Generates a rapid burst of suspicious activity (bulk exfiltration downloads and failed verifications)
     * which trips the AI anomaly engine and locks the victim account with an alert.
     */
    @PostMapping("/attack-simulate/{username}")
    public ResponseEntity<?> simulateAttack(@PathVariable String username) {
        User targetUser = userRepository.findByUsername(username)
                .or(() -> {
                    if ("police".equalsIgnoreCase(username)) return userRepository.findByUsername("officer_chen");
                    if ("officer_chen".equalsIgnoreCase(username)) return userRepository.findByUsername("police");
                    return java.util.Optional.empty();
                })
                .orElseThrow(() -> new IllegalArgumentException("Target user not found: " + username));

        // 1. Generate rapid download burst logs
        for (int i = 1; i <= 6; i++) {
            CustodyLog downloadLog = new CustodyLog(
                    (long) i,
                    "CASE-MAL-00" + i,
                    targetUser.getId(),
                    targetUser.getUsername(),
                    targetUser.getRole().name(),
                    CustodyAction.DOWNLOAD,
                    "198.51.100.44",
                    "RAPID EXFILTRATION SIMULATION: Automated bulk extraction of evidence partition #" + i
            );
            downloadLog.setTimestamp(LocalDateTime.now().minusSeconds(i * 10));
            custodyLogRepository.save(downloadLog);
        }

        // 2. Generate failed tamper verification logs
        for (int i = 1; i <= 3; i++) {
            CustodyLog verifyLog = new CustodyLog(
                    (long) i,
                    "CASE-MAL-00" + i,
                    targetUser.getId(),
                    targetUser.getUsername(),
                    targetUser.getRole().name(),
                    CustodyAction.VERIFY,
                    "198.51.100.44",
                    "FAILED VERIFICATION SIMULATION: Cryptographic mismatch TAMPER detected on block"
            );
            verifyLog.setTimestamp(LocalDateTime.now().minusSeconds(i * 20));
            custodyLogRepository.save(verifyLog);
        }

        // 3. Trigger Anomaly Evaluation
        AnomalyDetectionService.RiskAssessment assessment =
                anomalyDetectionService.evaluateUserRisk(targetUser, "SIMULATED_ATTACK");

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Cyberattack pattern simulated successfully. AI anomaly detection triggered account lockout.");
        response.put("targetUsername", username);
        response.put("riskScore", assessment.getRiskScore());
        response.put("accountLocked", assessment.isLocked());
        response.put("violations", assessment.getViolations());

        return ResponseEntity.ok(response);
    }
}

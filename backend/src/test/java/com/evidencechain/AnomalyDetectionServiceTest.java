package com.evidencechain;

import com.evidencechain.ai.AnomalyDetectionService;
import com.evidencechain.model.CustodyAction;
import com.evidencechain.model.CustodyLog;
import com.evidencechain.model.SecurityAlert;
import com.evidencechain.model.User;
import com.evidencechain.repository.CustodyLogRepository;
import com.evidencechain.repository.SecurityAlertRepository;
import com.evidencechain.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class AnomalyDetectionServiceTest {

    @Autowired
    private AnomalyDetectionService anomalyDetectionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustodyLogRepository custodyLogRepository;

    @Autowired
    private SecurityAlertRepository securityAlertRepository;

    @Test
    @DisplayName("Phase 4: Bulk download flood triggers high risk score and automatic account lockout")
    public void testDownloadBurstLockout() {
        User user = userRepository.findByUsername("officer_chen").orElseThrow();
        assertFalse(user.isAccountLocked(), "Initial account must not be locked");

        // Seed 6 rapid downloads in the last 3 minutes
        for (int i = 0; i < 6; i++) {
            CustodyLog log = new CustodyLog(
                    (long) (i + 1),
                    "CASE-BURST-001",
                    user.getId(),
                    user.getUsername(),
                    user.getRole().name(),
                    CustodyAction.DOWNLOAD,
                    "10.0.0.1",
                    "Download evidence"
            );
            log.setTimestamp(LocalDateTime.now().minusMinutes(1));
            custodyLogRepository.save(log);
        }

        // Also add 3 failed verifications
        for (int i = 0; i < 3; i++) {
            CustodyLog log = new CustodyLog(
                    (long) (i + 1),
                    "CASE-BURST-001",
                    user.getId(),
                    user.getUsername(),
                    user.getRole().name(),
                    CustodyAction.VERIFY,
                    "10.0.0.1",
                    "Cryptographic TAMPER alert detected"
            );
            log.setTimestamp(LocalDateTime.now().minusMinutes(2));
            custodyLogRepository.save(log);
        }

        AnomalyDetectionService.RiskAssessment assessment =
                anomalyDetectionService.evaluateUserRisk(user, "STANDARD_EVAL");

        assertTrue(assessment.getRiskScore() >= 75, "Risk score must meet or exceed lockout threshold (75)");
        assertTrue(assessment.isLocked(), "Account must be automatically locked");

        // Verify database state
        User updatedUser = userRepository.findById(user.getId()).orElseThrow();
        assertTrue(updatedUser.isAccountLocked());

        List<SecurityAlert> alerts = securityAlertRepository.findByUserIdOrderByTimestampDesc(user.getId());
        assertFalse(alerts.isEmpty(), "Security alert must be created");
        assertEquals("BEHAVIORAL_ANOMALY_LOCKOUT", alerts.get(0).getRuleViolated());
    }

    @Test
    @DisplayName("Phase 4: Simulated cyberattack triggers immediate lockout and alert generation")
    public void testSimulatedAttackLockout() {
        User user = userRepository.findByUsername("police").orElseThrow();
        assertFalse(user.isAccountLocked());

        AnomalyDetectionService.RiskAssessment assessment =
                anomalyDetectionService.evaluateUserRisk(user, "SIMULATED_ATTACK");

        assertTrue(assessment.getRiskScore() >= 90);
        assertTrue(assessment.isLocked());

        User lockedUser = userRepository.findById(user.getId()).orElseThrow();
        assertTrue(lockedUser.isAccountLocked());
    }
}

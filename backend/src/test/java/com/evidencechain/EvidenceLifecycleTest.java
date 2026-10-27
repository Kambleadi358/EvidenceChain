package com.evidencechain;

import com.evidencechain.dto.EvidenceResponse;
import com.evidencechain.dto.EvidenceUploadRequest;
import com.evidencechain.dto.VerificationResultDto;
import com.evidencechain.model.CustodyLog;
import com.evidencechain.model.Role;
import com.evidencechain.model.User;
import com.evidencechain.repository.UserRepository;
import com.evidencechain.service.CertificateService;
import com.evidencechain.service.CustodyService;
import com.evidencechain.service.EvidenceService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.annotation.DirtiesContext;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class EvidenceLifecycleTest {

    @Autowired
    private EvidenceService evidenceService;

    @Autowired
    private CustodyService custodyService;

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Phase 3: Complete Evidence lifecycle - Upload, Verify MATCH, Tamper, Verify TAMPERED, Transfer, PDF Certificate")
    public void testCompleteEvidenceLifecycle() throws Exception {
        User policeUser = userRepository.findByUsername("officer_chen").orElseThrow();
        User adminUser = userRepository.findByUsername("admin").orElseThrow();
        User receivingOfficer = userRepository.findByUsername("police").orElseThrow();

        // 1. Upload Evidence
        String content = "System event log: Unauthorized root access attempt detected at IP 192.168.1.105";
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "auth_audit.log",
                "text/plain",
                content.getBytes(StandardCharsets.UTF_8)
        );

        EvidenceUploadRequest uploadRequest = new EvidenceUploadRequest();
        uploadRequest.setCaseNumber("CASE-2026-X99");
        uploadRequest.setTitle("Server Unauthorized Access Log");
        uploadRequest.setDescription("Forensic disk extraction of system auth log");
        uploadRequest.setLocation("Server Room Rack 4, Downtown Data Center");
        uploadRequest.setCollectionTimestamp(LocalDateTime.now().minusHours(2));

        EvidenceResponse uploaded = evidenceService.uploadEvidence(mockFile, uploadRequest, policeUser, "127.0.0.1");
        assertNotNull(uploaded);
        assertNotNull(uploaded.getId());
        assertNotNull(uploaded.getFileHash());
        assertNotNull(uploaded.getBlockIndex());
        assertEquals(100, uploaded.getAuthenticityScore());

        // 2. Initial Verification -> Must MATCH
        VerificationResultDto initialVerify = evidenceService.verifyEvidence(uploaded.getId(), policeUser, "127.0.0.1");
        assertEquals("MATCH", initialVerify.getStatus());
        assertTrue(initialVerify.isVerified());
        assertTrue(initialVerify.isChainValid());

        // 3. Admin Simulates Tamper (flips byte on disk)
        evidenceService.simulateTamper(uploaded.getId(), adminUser, "127.0.0.1");

        // 4. Second Verification -> Must detect TAMPERED
        VerificationResultDto tamperedVerify = evidenceService.verifyEvidence(uploaded.getId(), policeUser, "127.0.0.1");
        assertEquals("TAMPERED", tamperedVerify.getStatus());
        assertFalse(tamperedVerify.isVerified());
        assertNotEquals(tamperedVerify.getExpectedHash(), tamperedVerify.getActualHash());

        // 5. Generate PDF Certificate
        byte[] pdfBytes = certificateService.generateCertificatePdf(uploaded.getId());
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 500);
        String header = new String(pdfBytes, 0, 5, StandardCharsets.US_ASCII);
        assertEquals("%PDF-", header, "Certificate must be a valid PDF starting with %PDF-");

        // 6. Transfer Custody to primary police account
        custodyService.transferCustody(
                uploaded.getId(),
                "police",
                "Transferred to primary police account for forensic review",
                policeUser,
                "127.0.0.1"
        );

        List<CustodyLog> logs = custodyService.getCustodyLogsByEvidence(uploaded.getId());
        assertFalse(logs.isEmpty());
        assertTrue(logs.stream().anyMatch(l -> l.getAction().name().equals("TRANSFER")));
        assertTrue(logs.stream().anyMatch(l -> l.getAction().name().equals("TAMPER_SIMULATION")));
    }
}

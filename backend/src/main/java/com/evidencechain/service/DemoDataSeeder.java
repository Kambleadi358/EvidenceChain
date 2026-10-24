package com.evidencechain.service;

import com.evidencechain.ai.AutoTaggingService;
import com.evidencechain.ai.HeuristicFingerprintService;
import com.evidencechain.ledger.BlockchainService;
import com.evidencechain.ledger.HashUtil;
import com.evidencechain.model.*;
import com.evidencechain.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

import org.springframework.context.annotation.Profile;

/**
 * DemoDataSeeder populates realistic demo cybercrime cases, forensic evidence files on disk,
 * corresponding blockchain ledger blocks, chain of custody logs, and initial anomaly alerts.
 */
@Component
@Profile("!test")
@Order(2)
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final UserRepository userRepository;
    private final EvidenceRepository evidenceRepository;
    private final BlockRepository blockRepository;
    private final BlockchainService blockchainService;
    private final CustodyLogRepository custodyLogRepository;
    private final SecurityAlertRepository securityAlertRepository;
    private final HeuristicFingerprintService heuristicFingerprintService;
    private final AutoTaggingService autoTaggingService;

    @Value("${evidencechain.storage.path:./storage}")
    private String storageBasePath;

    public DemoDataSeeder(UserRepository userRepository,
                          EvidenceRepository evidenceRepository,
                          BlockRepository blockRepository,
                          BlockchainService blockchainService,
                          CustodyLogRepository custodyLogRepository,
                          SecurityAlertRepository securityAlertRepository,
                          HeuristicFingerprintService heuristicFingerprintService,
                          AutoTaggingService autoTaggingService) {
        this.userRepository = userRepository;
        this.evidenceRepository = evidenceRepository;
        this.blockRepository = blockRepository;
        this.blockchainService = blockchainService;
        this.custodyLogRepository = custodyLogRepository;
        this.securityAlertRepository = securityAlertRepository;
        this.heuristicFingerprintService = heuristicFingerprintService;
        this.autoTaggingService = autoTaggingService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (evidenceRepository.count() > 0) {
            logger.info("Demo evidence already seeded. Skipping seeder.");
            return;
        }

        logger.info("Seeding realistic forensic cases and blockchain blocks for college demonstration...");

        User chen = userRepository.findByUsername("police")
                .orElseGet(() -> userRepository.findByUsername("officer_chen").orElseThrow());
        User miller = userRepository.findByUsername("agent_miller")
                .orElseGet(() -> chen);
        User vance = userRepository.findByUsername("judge")
                .orElseGet(() -> userRepository.findByUsername("judge_vance").orElseThrow());

        // -------------------------------------------------------------
        // CASE 1: Municipal Water Infrastructure Ransomware Breach
        // -------------------------------------------------------------
        String case1 = "CASE-2026-CY01";
        String case1Content = "2026-10-18 01:14:22 [ALERT] Unauthorized reverse shell opened to C2 server 198.51.100.201:4444.\n"
                + "2026-10-18 01:14:35 [CRITICAL] Cryptographic ransomware encryption routine initiated by user 'water_admin'.\n"
                + "2026-10-18 01:15:02 [FATAL] Master Supervisory Control and Data Acquisition (SCADA) PLC firmware modified.\n";

        seedEvidence(
                case1,
                "SCADA Core Controller Intrusions Log",
                "Forensic extraction of compromised SCADA controller access log showing remote reverse shell and ransomware deployment.",
                "scada_breach_event.log",
                "text/plain",
                case1Content.getBytes(StandardCharsets.UTF_8),
                chen,
                "Municipal Water Treatment Facility - Server Room B, Rack 2",
                LocalDateTime.now().minusDays(3),
                "192.168.10.14"
        );

        String case1Ransom = "=== ATTENTION MUNICIPAL UTILITIES ===\n"
                + "Your SCADA industrial control network has been encrypted using military grade AES-256.\n"
                + "To decrypt your water distribution systems, send 45 BTC to bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh.\n"
                + "Any attempt to reverse engineer will result in permanent key destruction.\n";

        seedEvidence(
                case1,
                "Extortionist Ransom Demand Note",
                "Physical text artifact found dropped on infected SCADA human-machine interface (HMI).",
                "HOW_TO_RECOVER_WATER_DATA.txt",
                "text/plain",
                case1Ransom.getBytes(StandardCharsets.UTF_8),
                chen,
                "SCADA Terminal Console #1 - Control Room",
                LocalDateTime.now().minusDays(3).plusHours(2),
                "192.168.10.15"
        );

        // -------------------------------------------------------------
        // CASE 2: Executive Impersonation & Wire Fraud Spear-Phishing
        // -------------------------------------------------------------
        String case2 = "CASE-2026-CY02";
        String case2Email = "Received: from mail-relay.darkgateway.net by corp-exchange.victimcorp.com\n"
                + "From: \"CEO Robert Hastings\" <robert.hastings@ceo-exec-secure.com>\n"
                + "To: \"Finance Director Elena Vance\" <elena.vance@victimcorp.com>\n"
                + "Subject: URGENT & CONFIDENTIAL: Acquisition Escrow Wire Transfer\n"
                + "Date: Thu, 16 Oct 2026 09:15:00 -0400\n\n"
                + "Elena, please immediately wire $1,250,000 to the offshore escrow account before 11:00 AM EST.\n"
                + "This is for our secret acquisition of FinTech Global.\n";

        seedEvidence(
                case2,
                "Spear-Phishing CEO Fraud Email Artifact",
                "Complete RFC 822 email headers and message body demonstrating domain typosquatting and BEC fraud.",
                "exec_wire_transfer_phish.eml",
                "message/rfc822",
                case2Email.getBytes(StandardCharsets.UTF_8),
                miller,
                "Corporate Mail Gateway - Exchange Archive Partition /var/mail",
                LocalDateTime.now().minusDays(2),
                "10.50.1.200"
        );

        // -------------------------------------------------------------
        // CASE 3: Critical Bank Infrastructure DDoS & C2 Botnet
        // -------------------------------------------------------------
        String case3 = "CASE-2026-CY03";
        // Header bytes mimicking standard PCAP format (d4 c3 b2 a1) + dummy network traffic
        byte[] pcapBytes = new byte[512];
        pcapBytes[0] = (byte) 0xd4;
        pcapBytes[1] = (byte) 0xc3;
        pcapBytes[2] = (byte) 0xb2;
        pcapBytes[3] = (byte) 0xa1;
        byte[] payload = "TCP SYN Flood packets with Wireshark trace targeting TCP port 443 of Core Banking API".getBytes(StandardCharsets.UTF_8);
        System.arraycopy(payload, 0, pcapBytes, 4, Math.min(payload.length, pcapBytes.length - 4));

        seedEvidence(
                case3,
                "SYN Flood Network Traffic Capture (PCAP)",
                "Perimeter network packet capture snippet capturing coordinated 25 Gbps volumetric SYN flood attack.",
                "ddos_botnet_flood.pcap",
                "application/vnd.tcpdump.pcap",
                pcapBytes,
                miller,
                "Border Gateway Router Core-1, Optical Tap 3",
                LocalDateTime.now().minusDays(1),
                "172.16.0.1"
        );

        // -------------------------------------------------------------
        // Seed Initial Security Alerts for Demo Inspection
        // -------------------------------------------------------------
        SecurityAlert alert1 = new SecurityAlert(
                chen.getId(),
                chen.getUsername(),
                "OFF_HOURS_ACCESS",
                45,
                "Investigator logged into evidence vault during off-duty nighttime hours (02:44 AM local time)."
        );
        alert1.setTimestamp(LocalDateTime.now().minusHours(8));
        securityAlertRepository.save(alert1);

        SecurityAlert alert2 = new SecurityAlert(
                miller.getId(),
                miller.getUsername(),
                "DOWNLOAD_BURST_ELEVATION",
                60,
                "High frequency raw evidence extractions (4 downloads in 6 minutes). Behavioral baseline monitoring elevated."
        );
        alert2.setTimestamp(LocalDateTime.now().minusHours(3));
        securityAlertRepository.save(alert2);

        logger.info("DemoDataSeeder successfully seeded 3 cybercrime cases, 4 evidence files, 4 ledger blocks, and initial security alerts.");
    }

    private void seedEvidence(String caseNumber, String title, String description, String fileName,
                              String fileType, byte[] fileBytes, User investigator,
                              String location, LocalDateTime collectionTime, String nodeIp) {
        try {
            // Write physical file to storage
            Path caseDir = Paths.get(storageBasePath, caseNumber).toAbsolutePath().normalize();
            Files.createDirectories(caseDir);
            Path filePath = caseDir.resolve(fileName);
            Files.write(filePath, fileBytes);

            String sha256 = HashUtil.sha256(fileBytes);
            byte[] headerBytes = new byte[Math.min(fileBytes.length, 64)];
            System.arraycopy(fileBytes, 0, headerBytes, 0, headerBytes.length);

            HeuristicFingerprintService.FingerprintResult fingerprint =
                    heuristicFingerprintService.evaluate(fileName, headerBytes, fileBytes.length, collectionTime);

            String textSnippet = new String(headerBytes, StandardCharsets.UTF_8);
            String autoTags = autoTaggingService.generateTags(fileName, fileType, headerBytes, textSnippet);

            Evidence evidence = new Evidence();
            evidence.setCaseNumber(caseNumber);
            evidence.setTitle(title);
            evidence.setDescription(description);
            evidence.setFileName(fileName);
            evidence.setFileType(fileType);
            evidence.setFileSize((long) fileBytes.length);
            evidence.setFileHash(sha256);
            evidence.setStoredPath(filePath.toString());
            evidence.setAuthenticityScore(fingerprint.getAuthenticityScore());
            evidence.setHeuristicFlags(fingerprint.getHeuristicFlags());
            evidence.setAutoTags(autoTags);
            evidence.setInvestigatorId(investigator.getUsername());
            evidence.setInvestigatorName(investigator.getFullName());
            evidence.setLocation(location);
            evidence.setCollectionTimestamp(collectionTime);
            evidence.setUploadedAt(LocalDateTime.now().minusDays(1));
            evidence.setCurrentOwnerId(investigator.getId());
            evidence.setTampered(false);

            Evidence saved = evidenceRepository.save(evidence);

            // Mint blockchain block
            Block block = blockchainService.mintBlock(
                    saved.getId(),
                    sha256,
                    saved.getAuthenticityScore(),
                    investigator.getUsername()
            );

            // Seed custody history
            CustodyLog uploadLog = new CustodyLog(
                    saved.getId(),
                    caseNumber,
                    investigator.getId(),
                    investigator.getUsername(),
                    investigator.getRole().name(),
                    CustodyAction.UPLOAD,
                    nodeIp,
                    "Initial forensic seizure intake and dual-layer blockchain hashing."
            );
            uploadLog.setTimestamp(collectionTime.plusMinutes(15));
            custodyLogRepository.save(uploadLog);

            CustodyLog verifyLog = new CustodyLog(
                    saved.getId(),
                    caseNumber,
                    investigator.getId(),
                    investigator.getUsername(),
                    investigator.getRole().name(),
                    CustodyAction.VERIFY,
                    nodeIp,
                    String.format("Forensic cryptographic verification: MATCH. File SHA-256 matches Block #%d digest.", block.getBlockIndex())
            );
            verifyLog.setTimestamp(collectionTime.plusHours(1));
            custodyLogRepository.save(verifyLog);

        } catch (IOException e) {
            logger.error("Failed to seed evidence file: {}", fileName, e);
        }
    }
}

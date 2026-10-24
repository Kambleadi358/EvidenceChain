package com.evidencechain.service;

import com.evidencechain.ai.AutoTaggingService;
import com.evidencechain.ai.HeuristicFingerprintService;
import com.evidencechain.dto.EvidenceResponse;
import com.evidencechain.dto.EvidenceUploadRequest;
import com.evidencechain.ledger.BlockchainService;
import com.evidencechain.ledger.HashUtil;
import com.evidencechain.model.*;
import com.evidencechain.repository.BlockRepository;
import com.evidencechain.repository.CustodyLogRepository;
import com.evidencechain.repository.EvidenceRepository;
import com.evidencechain.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EvidenceService {

    private static final Logger logger = LoggerFactory.getLogger(EvidenceService.class);

    private final EvidenceRepository evidenceRepository;
    private final BlockRepository blockRepository;
    private final BlockchainService blockchainService;
    private final CustodyLogRepository custodyLogRepository;
    private final UserRepository userRepository;
    private final HeuristicFingerprintService heuristicFingerprintService;
    private final AutoTaggingService autoTaggingService;

    @Value("${evidencechain.storage.path:./storage}")
    private String storageBasePath;

    public EvidenceService(EvidenceRepository evidenceRepository,
                           BlockRepository blockRepository,
                           BlockchainService blockchainService,
                           CustodyLogRepository custodyLogRepository,
                           UserRepository userRepository,
                           HeuristicFingerprintService heuristicFingerprintService,
                           AutoTaggingService autoTaggingService) {
        this.evidenceRepository = evidenceRepository;
        this.blockRepository = blockRepository;
        this.blockchainService = blockchainService;
        this.custodyLogRepository = custodyLogRepository;
        this.userRepository = userRepository;
        this.heuristicFingerprintService = heuristicFingerprintService;
        this.autoTaggingService = autoTaggingService;
    }

    @Transactional
    public EvidenceResponse uploadEvidence(MultipartFile file, EvidenceUploadRequest request, User user, String ipAddress) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file");
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed_evidence";
        String cleanCaseNumber = request.getCaseNumber().replaceAll("[^a-zA-Z0-9-_]", "_");
        Path caseDir = Paths.get(storageBasePath, cleanCaseNumber).toAbsolutePath().normalize();
        Files.createDirectories(caseDir);

        String storedFileName = System.currentTimeMillis() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        Path destinationPath = caseDir.resolve(storedFileName);

        // Store file onto local disk (Files never go on the blockchain, only cryptographic hashes)
        Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);

        byte[] fileBytes = Files.readAllBytes(destinationPath);

        // 1. Compute SHA-256 digest
        String sha256Hash = HashUtil.sha256(fileBytes);

        // 2. Sample header bytes and text snippet for AI auto-tagging and heuristic fingerprinting
        byte[] headerBytes = Arrays.copyOf(fileBytes, Math.min(fileBytes.length, 64));
        String textSnippet = "";
        try {
            textSnippet = new String(Arrays.copyOf(fileBytes, Math.min(fileBytes.length, 2048)), StandardCharsets.UTF_8);
        } catch (Exception ignored) {
        }

        // 3. Heuristic Pre-screening (Authenticity score 0-100)
        LocalDateTime collectionTime = request.getCollectionTimestamp() != null ? request.getCollectionTimestamp() : LocalDateTime.now();
        HeuristicFingerprintService.FingerprintResult fingerprintResult =
                heuristicFingerprintService.evaluate(originalFilename, headerBytes, file.getSize(), collectionTime);

        // 4. Automated tag generation
        String autoTags = autoTaggingService.generateTags(originalFilename, file.getContentType(), headerBytes, textSnippet);

        // 5. Create Evidence Entity
        Evidence evidence = new Evidence();
        evidence.setCaseNumber(request.getCaseNumber().trim());
        evidence.setTitle(request.getTitle().trim());
        evidence.setDescription(request.getDescription());
        evidence.setFileName(originalFilename);
        evidence.setFileType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        evidence.setFileSize(file.getSize());
        evidence.setFileHash(sha256Hash);
        evidence.setStoredPath(destinationPath.toString());
        evidence.setAuthenticityScore(fingerprintResult.getAuthenticityScore());
        evidence.setHeuristicFlags(fingerprintResult.getHeuristicFlags());
        evidence.setAutoTags(autoTags);
        evidence.setInvestigatorId(user.getUsername());
        evidence.setInvestigatorName(user.getFullName());
        evidence.setLocation(request.getLocation().trim());
        evidence.setCollectionTimestamp(collectionTime);
        evidence.setUploadedAt(LocalDateTime.now());
        evidence.setCurrentOwnerId(user.getId());
        evidence.setTampered(false);

        Evidence savedEvidence = evidenceRepository.save(evidence);

        // 6. Mint immutable Blockchain Ledger block
        Block block = blockchainService.mintBlock(
                savedEvidence.getId(),
                sha256Hash,
                savedEvidence.getAuthenticityScore(),
                user.getUsername()
        );

        // 7. Write Chain of Custody record for UPLOAD
        CustodyLog log = new CustodyLog(
                savedEvidence.getId(),
                savedEvidence.getCaseNumber(),
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                CustodyAction.UPLOAD,
                ipAddress,
                String.format("Initial evidence registration. Minted Block #%d with SHA-256: %s", block.getBlockIndex(), sha256Hash)
        );
        custodyLogRepository.save(log);

        logger.info("Evidence uploaded successfully: ID={}, Case={}, BlockIndex={}", savedEvidence.getId(), savedEvidence.getCaseNumber(), block.getBlockIndex());

        return EvidenceResponse.fromEntity(savedEvidence, block.getBlockIndex(), block.getBlockHash(), user.getFullName());
    }

    @Transactional(readOnly = true)
    public List<EvidenceResponse> listEvidence(User user, String caseNumber, String tag, String search) {
        List<Evidence> evidenceList;

        if (user.getRole() == Role.POLICE) {
            // Police officers view their own assigned cases or uploaded evidence
            evidenceList = evidenceRepository.findByCurrentOwnerId(user.getId());
            if (evidenceList.isEmpty()) {
                // If demo seeder ran with legacy user id or current owner is not set, allow viewing cases for demo
                evidenceList = evidenceRepository.findAllByOrderByUploadedAtDesc();
            }
        } else {
            // Judge and Admin have cross-case visibility
            evidenceList = evidenceRepository.findAllByOrderByUploadedAtDesc();
        }

        return evidenceList.stream()
                .filter(e -> {
                    if (caseNumber != null && !caseNumber.isBlank()) {
                        if (!e.getCaseNumber().equalsIgnoreCase(caseNumber.trim())) return false;
                    }
                    if (tag != null && !tag.isBlank()) {
                        if (e.getAutoTags() == null || !e.getAutoTags().toLowerCase().contains(tag.trim().toLowerCase())) return false;
                    }
                    if (search != null && !search.isBlank()) {
                        String s = search.trim().toLowerCase();
                        boolean match = (e.getTitle() != null && e.getTitle().toLowerCase().contains(s))
                                || (e.getFileName() != null && e.getFileName().toLowerCase().contains(s))
                                || (e.getCaseNumber() != null && e.getCaseNumber().toLowerCase().contains(s))
                                || (e.getAutoTags() != null && e.getAutoTags().toLowerCase().contains(s));
                        if (!match) return false;
                    }
                    return true;
                })
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Evidence getEvidenceEntity(Long id) {
        return evidenceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Evidence record not found with id: " + id));
    }

    @Transactional
    public EvidenceResponse getEvidenceById(Long id, User user, String ipAddress) {
        Evidence evidence = getEvidenceEntity(id);

        // Record custody VIEW action
        CustodyLog log = new CustodyLog(
                evidence.getId(),
                evidence.getCaseNumber(),
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                CustodyAction.VIEW,
                ipAddress,
                "Inspected evidence metadata and integrity records"
        );
        custodyLogRepository.save(log);

        return toResponseDto(evidence);
    }

    @Transactional(readOnly = true)
    public File getEvidenceFile(Long id) {
        Evidence evidence = getEvidenceEntity(id);
        File file = new File(evidence.getStoredPath());
        if (!file.exists()) {
            throw new IllegalStateException("Evidence file not found on disk at: " + evidence.getStoredPath());
        }
        return file;
    }

    @Transactional
    public com.evidencechain.dto.VerificationResultDto verifyEvidence(Long evidenceId, User user, String ipAddress) {
        Evidence evidence = getEvidenceEntity(evidenceId);
        Block block = blockRepository.findByEvidenceId(evidenceId)
                .orElseThrow(() -> new IllegalStateException("No blockchain block found for evidence ID: " + evidenceId));

        File file = new File(evidence.getStoredPath());
        if (!file.exists()) {
            throw new IllegalStateException("Evidence file missing from disk storage: " + evidence.getStoredPath());
        }

        String currentHash;
        try {
            byte[] currentBytes = Files.readAllBytes(file.toPath());
            currentHash = HashUtil.sha256(currentBytes);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read evidence file for cryptographic verification", e);
        }

        com.evidencechain.dto.ChainValidationDto chainValidation = blockchainService.validateChain();
        boolean hashMatches = currentHash.equalsIgnoreCase(block.getFileHash());
        boolean overallVerified = hashMatches && chainValidation.isValid();

        com.evidencechain.dto.VerificationResultDto result = new com.evidencechain.dto.VerificationResultDto();
        result.setEvidenceId(evidence.getId());
        result.setCaseNumber(evidence.getCaseNumber());
        result.setFileName(evidence.getFileName());
        result.setStatus(hashMatches ? "MATCH" : "TAMPERED");
        result.setVerified(overallVerified);
        result.setExpectedHash(block.getFileHash());
        result.setActualHash(currentHash);
        result.setBlockIndex(block.getBlockIndex());
        result.setBlockHash(block.getBlockHash());
        result.setChainValid(chainValidation.isValid());
        result.setChainValidationMessage(chainValidation.getReason());
        result.setVerifiedBy(user.getFullName() + " (" + user.getRole().name() + ")");
        result.setVerifiedAt(LocalDateTime.now());

        if (hashMatches) {
            result.setDetails(String.format("Cryptographic MATCH: File SHA-256 matches Block #%d digest exactly. Blockchain integrity is valid.", block.getBlockIndex()));
            if (evidence.isTampered()) {
                evidence.setTampered(false);
                evidenceRepository.save(evidence);
            }
        } else {
            result.setDetails(String.format("TAMPER ALERT: Physical file SHA-256 (%s) diverged from immutable Block #%d ledger digest (%s)!",
                    currentHash, block.getBlockIndex(), block.getFileHash()));
            evidence.setTampered(true);
            evidenceRepository.save(evidence);
        }

        // Record custody VERIFY action
        CustodyLog log = new CustodyLog(
                evidence.getId(),
                evidence.getCaseNumber(),
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                CustodyAction.VERIFY,
                ipAddress,
                String.format("Cryptographic verification performed: %s (File hash: %s, Block hash: %s)",
                        result.getStatus(), currentHash, block.getBlockHash())
        );
        custodyLogRepository.save(log);

        return result;
    }

    @Transactional
    public Map<String, Object> simulateTamper(Long evidenceId, User adminUser, String ipAddress) {
        if (adminUser.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Only administrators can simulate evidence tampering for demonstration purposes.");
        }

        Evidence evidence = getEvidenceEntity(evidenceId);
        File file = new File(evidence.getStoredPath());
        if (!file.exists()) {
            throw new IllegalStateException("Evidence file not found on disk at: " + evidence.getStoredPath());
        }

        try {
            byte[] bytes = Files.readAllBytes(file.toPath());
            if (bytes.length > 0) {
                // Invert bits in the middle of the file to simulate tampering
                int targetByte = bytes.length / 2;
                bytes[targetByte] = (byte) (bytes[targetByte] ^ 0xFF);
            }
            Files.write(file.toPath(), bytes);
        } catch (IOException e) {
            throw new RuntimeException("Error injecting tamper into file", e);
        }

        evidence.setTampered(true);
        evidenceRepository.save(evidence);

        CustodyLog log = new CustodyLog(
                evidence.getId(),
                evidence.getCaseNumber(),
                adminUser.getId(),
                adminUser.getUsername(),
                adminUser.getRole().name(),
                CustodyAction.TAMPER_SIMULATION,
                ipAddress,
                "ADMIN DEMO ACTION: Injected 1-byte payload corruption into stored file to simulate physical evidence tampering"
        );
        custodyLogRepository.save(log);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Tamper simulated successfully. Stored file bytes were altered on disk.");
        response.put("evidenceId", evidenceId);
        response.put("fileName", evidence.getFileName());
        response.put("isTampered", true);
        return response;
    }

    public EvidenceResponse toResponseDto(Evidence evidence) {
        Optional<Block> blockOpt = blockRepository.findByEvidenceId(evidence.getId());
        Long blockIndex = blockOpt.map(Block::getBlockIndex).orElse(null);
        String blockHash = blockOpt.map(Block::getBlockHash).orElse(null);

        String ownerName = null;
        if (evidence.getCurrentOwnerId() != null) {
            ownerName = userRepository.findById(evidence.getCurrentOwnerId())
                    .map(User::getFullName)
                    .orElse("Unknown Owner");
        }

        return EvidenceResponse.fromEntity(evidence, blockIndex, blockHash, ownerName);
    }
}

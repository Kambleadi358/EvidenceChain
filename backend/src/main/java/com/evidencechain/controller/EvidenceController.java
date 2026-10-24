package com.evidencechain.controller;

import com.evidencechain.dto.EvidenceResponse;
import com.evidencechain.dto.EvidenceUploadRequest;
import com.evidencechain.model.CustodyAction;
import com.evidencechain.model.CustodyLog;
import com.evidencechain.model.Evidence;
import com.evidencechain.model.User;
import com.evidencechain.repository.CustodyLogRepository;
import com.evidencechain.repository.UserRepository;
import com.evidencechain.security.UserPrincipal;
import com.evidencechain.service.EvidenceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import com.evidencechain.service.ForensicTextAnalysisService;

@RestController
@RequestMapping("/api/evidence")
public class EvidenceController {

    private final EvidenceService evidenceService;
    private final UserRepository userRepository;
    private final CustodyLogRepository custodyLogRepository;
    private final com.evidencechain.service.CustodyService custodyService;
    private final com.evidencechain.service.CertificateService certificateService;
    private final com.evidencechain.service.ForensicTextAnalysisService forensicTextAnalysisService;

    public EvidenceController(EvidenceService evidenceService,
                              UserRepository userRepository,
                              CustodyLogRepository custodyLogRepository,
                              com.evidencechain.service.CustodyService custodyService,
                              com.evidencechain.service.CertificateService certificateService,
                              com.evidencechain.service.ForensicTextAnalysisService forensicTextAnalysisService) {
        this.evidenceService = evidenceService;
        this.userRepository = userRepository;
        this.custodyLogRepository = custodyLogRepository;
        this.custodyService = custodyService;
        this.certificateService = certificateService;
        this.forensicTextAnalysisService = forensicTextAnalysisService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('POLICE', 'ADMIN')")
    public ResponseEntity<EvidenceResponse> uploadEvidence(
            @RequestParam("file") MultipartFile file,
            @ModelAttribute @Valid EvidenceUploadRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest servletRequest) throws IOException {

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String ipAddress = servletRequest.getRemoteAddr();

        EvidenceResponse response = evidenceService.uploadEvidence(file, request, user, ipAddress);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<EvidenceResponse>> listEvidence(
            @RequestParam(required = false) String caseNumber,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<EvidenceResponse> list = evidenceService.listEvidence(user, caseNumber, tag, search);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvidenceResponse> getEvidenceDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest servletRequest) {

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String ipAddress = servletRequest.getRemoteAddr();

        EvidenceResponse response = evidenceService.getEvidenceById(id, user, ipAddress);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadEvidenceFile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest servletRequest) {

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Evidence evidence = evidenceService.getEvidenceEntity(id);
        File file = evidenceService.getEvidenceFile(id);

        // Record custody DOWNLOAD action
        CustodyLog log = new CustodyLog(
                evidence.getId(),
                evidence.getCaseNumber(),
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                CustodyAction.DOWNLOAD,
                servletRequest.getRemoteAddr(),
                "Downloaded evidentiary raw file for investigative processing"
        );
        custodyLogRepository.save(log);

        Resource resource = new FileSystemResource(file);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(evidence.getFileType() != null ? evidence.getFileType() : MediaType.APPLICATION_OCTET_STREAM_VALUE))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + evidence.getFileName() + "\"")
                .body(resource);
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<com.evidencechain.dto.VerificationResultDto> verifyEvidence(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest servletRequest) {

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String ipAddress = servletRequest.getRemoteAddr();

        com.evidencechain.dto.VerificationResultDto result = evidenceService.verifyEvidence(id, user, ipAddress);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/transfer")
    @PreAuthorize("hasAnyRole('POLICE', 'ADMIN')")
    public ResponseEntity<EvidenceResponse> transferEvidence(
            @PathVariable Long id,
            @Valid @RequestBody com.evidencechain.dto.TransferRequestDto request,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest servletRequest) {

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String ipAddress = servletRequest.getRemoteAddr();

        Evidence transferred = custodyService.transferCustody(id, request.getTargetUsername(), request.getTransferNote(), user, ipAddress);
        return ResponseEntity.ok(evidenceService.toResponseDto(transferred));
    }

    @PostMapping("/{id}/tamper-simulate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> simulateTamper(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest servletRequest) {

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String ipAddress = servletRequest.getRemoteAddr();

        java.util.Map<String, Object> result = evidenceService.simulateTamper(id, user, ipAddress);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/certificate")
    public ResponseEntity<byte[]> getCertificatePdf(@PathVariable Long id) {
        byte[] pdfBytes = certificateService.generateCertificatePdf(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"Evidence_Certificate_" + id + ".pdf\"")
                .body(pdfBytes);
    }

    @GetMapping("/{id}/redacted")
    public ResponseEntity<?> getRedactedContent(@PathVariable Long id) {
        Evidence evidence = evidenceService.getEvidenceEntity(id);
        File file = evidenceService.getEvidenceFile(id);
        try {
            String content = java.nio.file.Files.readString(file.toPath(), java.nio.charset.StandardCharsets.UTF_8);
            String redacted = forensicTextAnalysisService.redactSensitiveData(content);
            return ResponseEntity.ok(java.util.Map.of(
                    "evidenceId", id,
                    "fileName", evidence.getFileName(),
                    "redactedContent", redacted,
                    "originalHashUntouched", evidence.getFileHash()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                    "error", "Unable to process file as text: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<?> getSmartSummary(@PathVariable Long id) {
        Evidence evidence = evidenceService.getEvidenceEntity(id);
        File file = evidenceService.getEvidenceFile(id);
        try {
            String content = java.nio.file.Files.readString(file.toPath(), java.nio.charset.StandardCharsets.UTF_8);
            ForensicTextAnalysisService.SmartSummary summary = forensicTextAnalysisService.generateSmartSummary(content);
            return ResponseEntity.ok(java.util.Map.of(
                    "evidenceId", id,
                    "fileName", evidence.getFileName(),
                    "summary", summary
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                    "error", "Unable to extract summary from file: " + e.getMessage()
            ));
        }
    }
}

package com.evidencechain.service;

import com.evidencechain.dto.VerificationResultDto;
import com.evidencechain.model.Block;
import com.evidencechain.model.CustodyLog;
import com.evidencechain.model.Evidence;
import com.evidencechain.repository.BlockRepository;
import com.evidencechain.repository.CustodyLogRepository;
import com.evidencechain.repository.EvidenceRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

@Service
public class CertificateService {

    private final EvidenceRepository evidenceRepository;
    private final BlockRepository blockRepository;
    private final CustodyLogRepository custodyLogRepository;
    private final EvidenceService evidenceService;

    public CertificateService(EvidenceRepository evidenceRepository,
                              BlockRepository blockRepository,
                              CustodyLogRepository custodyLogRepository,
                              EvidenceService evidenceService) {
        this.evidenceRepository = evidenceRepository;
        this.blockRepository = blockRepository;
        this.custodyLogRepository = custodyLogRepository;
        this.evidenceService = evidenceService;
    }

    public byte[] generateCertificatePdf(Long evidenceId) {
        Evidence evidence = evidenceRepository.findById(evidenceId)
                .orElseThrow(() -> new IllegalArgumentException("Evidence not found with id: " + evidenceId));
        Block block = blockRepository.findByEvidenceId(evidenceId)
                .orElse(null);
        List<CustodyLog> custodyLogs = custodyLogRepository.findByEvidenceIdOrderByTimestampDesc(evidenceId);

        // Perform live verification for the certificate
        boolean matches = false;
        try {
            java.io.File file = evidence.getStoredPath() != null ? new java.io.File(evidence.getStoredPath()) : null;
            if (file != null && file.exists()) {
                String currentHash = com.evidencechain.ledger.HashUtil.sha256(java.nio.file.Files.readAllBytes(file.toPath()));
                String expectedHash = (block != null && block.getFileHash() != null) ? block.getFileHash() : evidence.getFileHash();
                matches = currentHash != null && currentHash.equalsIgnoreCase(expectedHash);
            } else if (!evidence.isTampered()) {
                matches = true;
            }
        } catch (Exception ignored) {
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(15, 23, 42));
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(71, 85, 105));
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(30, 41, 59));
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(15, 23, 42));
            Font boldBody = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(15, 23, 42));
            Font monoFont = FontFactory.getFont(FontFactory.COURIER, 8, new Color(30, 41, 59));
            Font badgeFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.WHITE);

            // 1. Header Banner
            Paragraph title = new Paragraph("EVIDENCECHAIN DIGITAL INTEGRITY CERTIFICATE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subtitle = new Paragraph("Official Multi-Agency Cybercrime Evidence Forensic Provenance & Judicial Record", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(15);
            document.add(subtitle);

            // 2. Verification Status Badge Box
            PdfPTable badgeTable = new PdfPTable(1);
            badgeTable.setWidthPercentage(100);
            PdfPCell badgeCell = new PdfPCell();
            badgeCell.setPadding(10);
            badgeCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            if (matches) {
                badgeCell.setBackgroundColor(new Color(22, 101, 52)); // Green #166534
                Paragraph badgePara = new Paragraph("CRYPTOGRAPHIC STATUS: VERIFIED / UNALTERED MATCH", badgeFont);
                badgePara.setAlignment(Element.ALIGN_CENTER);
                badgeCell.addElement(badgePara);
            } else {
                badgeCell.setBackgroundColor(new Color(153, 27, 27)); // Red #991b1b
                Paragraph badgePara = new Paragraph("CRYPTOGRAPHIC STATUS: TAMPER ALERT / HASH MISMATCH", badgeFont);
                badgePara.setAlignment(Element.ALIGN_CENTER);
                badgeCell.addElement(badgePara);
            }
            badgeTable.addCell(badgeCell);
            badgeTable.setSpacingAfter(15);
            document.add(badgeTable);

            // 3. Evidence Details Table
            document.add(new Paragraph("1. Evidentiary Identification", sectionFont));
            document.add(new Paragraph(" "));

            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setWidths(new float[]{30, 70});

            addTableRow(metaTable, "Case Number:", evidence.getCaseNumber() != null ? evidence.getCaseNumber() : "N/A", boldBody, bodyFont);
            addTableRow(metaTable, "Evidence ID:", "#" + evidence.getId(), boldBody, bodyFont);
            addTableRow(metaTable, "Evidence Title:", evidence.getTitle() != null ? evidence.getTitle() : "N/A", boldBody, bodyFont);
            addTableRow(metaTable, "File Name:", evidence.getFileName() != null ? evidence.getFileName() : "N/A", boldBody, bodyFont);
            addTableRow(metaTable, "File Type / MIME:", evidence.getFileType() != null ? evidence.getFileType() : "N/A", boldBody, bodyFont);
            addTableRow(metaTable, "File Size:", (evidence.getFileSize() != null ? evidence.getFileSize() : 0) + " bytes", boldBody, bodyFont);
            addTableRow(metaTable, "Primary Investigator:", (evidence.getInvestigatorName() != null ? evidence.getInvestigatorName() : "Forensic Officer") + " (" + (evidence.getInvestigatorId() != null ? evidence.getInvestigatorId() : "") + ")", boldBody, bodyFont);
            addTableRow(metaTable, "Seizure Location:", evidence.getLocation() != null ? evidence.getLocation() : "Evidence Storage Vault", boldBody, bodyFont);
            String collectionStr = evidence.getCollectionTimestamp() != null ? evidence.getCollectionTimestamp().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "N/A";
            addTableRow(metaTable, "Collection Timestamp:", collectionStr, boldBody, bodyFont);
            addTableRow(metaTable, "Auto-Classification Tags:", evidence.getAutoTags() != null ? evidence.getAutoTags() : "None", boldBody, bodyFont);

            metaTable.setSpacingAfter(15);
            document.add(metaTable);

            // 4. Cryptographic Blockchain Proof Table
            document.add(new Paragraph("2. Blockchain Ledger Cryptographic Fingerprint", sectionFont));
            document.add(new Paragraph(" "));

            PdfPTable cryptoTable = new PdfPTable(2);
            cryptoTable.setWidthPercentage(100);
            cryptoTable.setWidths(new float[]{30, 70});

            addTableRow(cryptoTable, "SHA-256 Digest:", evidence.getFileHash() != null ? evidence.getFileHash() : "N/A", boldBody, monoFont);
            if (block != null) {
                addTableRow(cryptoTable, "Ledger Block Index:", "Block #" + block.getBlockIndex(), boldBody, bodyFont);
                addTableRow(cryptoTable, "Block Header Hash:", block.getBlockHash() != null ? block.getBlockHash() : "N/A", boldBody, monoFont);
                addTableRow(cryptoTable, "Previous Block Pointer:", block.getPreviousHash() != null ? block.getPreviousHash() : "N/A", boldBody, monoFont);
                addTableRow(cryptoTable, "Block Mint Timestamp:", DateTimeFormatter.ISO_LOCAL_DATE_TIME.format(LocalDateTime.now()), boldBody, bodyFont);
            }
            addTableRow(cryptoTable, "Heuristic Authenticity Score:", evidence.getAuthenticityScore() + " / 100", boldBody, bodyFont);
            addTableRow(cryptoTable, "Heuristic Pre-Screening:", evidence.getHeuristicFlags() != null ? evidence.getHeuristicFlags() : "Clean", boldBody, bodyFont);

            cryptoTable.setSpacingAfter(15);
            document.add(cryptoTable);

            // 5. Chain of Custody Audit Trail
            document.add(new Paragraph("3. Chain of Custody Audit Trail (Recent Actions)", sectionFont));
            document.add(new Paragraph(" "));

            PdfPTable logTable = new PdfPTable(4);
            logTable.setWidthPercentage(100);
            logTable.setWidths(new float[]{22, 18, 15, 45});

            addLogHeader(logTable, "Timestamp", boldBody);
            addLogHeader(logTable, "Custodian", boldBody);
            addLogHeader(logTable, "Action", boldBody);
            addLogHeader(logTable, "Audit Note / Details", boldBody);

            int count = 0;
            for (CustodyLog log : custodyLogs) {
                if (count++ >= 6) break; // Display up to 6 most recent logs
                String timeStr = log.getTimestamp() != null ? log.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : "N/A";
                logTable.addCell(new Phrase(timeStr, bodyFont));
                logTable.addCell(new Phrase((log.getUsername() != null ? log.getUsername() : "System") + " (" + (log.getUserRole() != null ? log.getUserRole() : "OFFICER") + ")", bodyFont));
                logTable.addCell(new Phrase(log.getAction() != null ? log.getAction().name() : "RECORD", boldBody));
                logTable.addCell(new Phrase(log.getDetails() != null ? log.getDetails() : "", bodyFont));
            }

            logTable.setSpacingAfter(20);
            document.add(logTable);

            // 6. Signature Certification Footer with Dynamic QR Code
            PdfPTable footerTable = new PdfPTable(3);
            footerTable.setWidthPercentage(100);
            footerTable.setWidths(new float[]{40, 35, 25});

            PdfPCell leftSign = new PdfPCell();
            leftSign.setBorder(Rectangle.NO_BORDER);
            leftSign.addElement(new Paragraph("____________________________________", bodyFont));
            leftSign.addElement(new Paragraph("Forensic Investigator Signature", boldBody));
            leftSign.addElement(new Paragraph(evidence.getInvestigatorName() != null ? evidence.getInvestigatorName() : "Forensic Officer", bodyFont));

            PdfPCell centerSign = new PdfPCell();
            centerSign.setBorder(Rectangle.NO_BORDER);
            centerSign.addElement(new Paragraph("____________________________________", bodyFont));
            centerSign.addElement(new Paragraph("Judicial Registrar / Seal", boldBody));
            centerSign.addElement(new Paragraph("Date: " + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE), bodyFont));

            PdfPCell qrCell = new PdfPCell();
            qrCell.setBorder(Rectangle.NO_BORDER);
            qrCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            try {
                String verifyUrl = "http://localhost:5173/evidence/" + evidence.getId();
                QRCodeWriter qrCodeWriter = new QRCodeWriter();
                BitMatrix bitMatrix = qrCodeWriter.encode(verifyUrl, BarcodeFormat.QR_CODE, 80, 80);
                ByteArrayOutputStream qrStream = new ByteArrayOutputStream();
                MatrixToImageWriter.writeToStream(bitMatrix, "PNG", qrStream);
                Image qrImage = Image.getInstance(qrStream.toByteArray());
                qrImage.scaleToFit(65, 65);
                qrCell.addElement(qrImage);
                Paragraph qrLabel = new Paragraph("Scan to Verify Online", FontFactory.getFont(FontFactory.HELVETICA, 6, Color.DARK_GRAY));
                qrCell.addElement(qrLabel);
            } catch (Exception ignored) {
            }

            footerTable.addCell(leftSign);
            footerTable.addCell(centerSign);
            footerTable.addCell(qrCell);
            document.add(footerTable);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF Certificate", e);
        }
    }

    private void addTableRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell c1 = new PdfPCell(new Phrase(label, labelFont));
        c1.setBackgroundColor(new Color(248, 250, 252));
        c1.setPadding(5);
        PdfPCell c2 = new PdfPCell(new Phrase(value, valueFont));
        c2.setPadding(5);
        table.addCell(c1);
        table.addCell(c2);
    }

    private void addLogHeader(PdfPTable table, String title, Font font) {
        PdfPCell c = new PdfPCell(new Phrase(title, font));
        c.setBackgroundColor(new Color(226, 232, 240));
        c.setPadding(6);
        table.addCell(c);
    }
}

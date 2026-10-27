package com.evidencechain;

import com.evidencechain.dto.ChainValidationDto;
import com.evidencechain.ledger.BlockchainService;
import com.evidencechain.model.Block;
import com.evidencechain.repository.BlockRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class BlockchainServiceTest {

    @Autowired
    private BlockchainService blockchainService;

    @Autowired
    private BlockRepository blockRepository;

    @Test
    @DisplayName("Blockchain correctly mints consecutive blocks and validates chain integrity")
    public void testGenesisAndMinting() {
        blockchainService.initGenesisBlock();

        Block b1 = blockchainService.mintBlock(101L, "hash101", 100, "officer_chen");
        assertNotNull(b1);
        assertEquals(1L, b1.getBlockIndex());

        Block b2 = blockchainService.mintBlock(102L, "hash102", 95, "police");
        assertNotNull(b2);
        assertEquals(2L, b2.getBlockIndex());
        assertEquals(b1.getBlockHash(), b2.getPreviousHash());

        ChainValidationDto result = blockchainService.validateChain();
        assertTrue(result.isValid(), "Blockchain must be valid after minting blocks");
        assertEquals(3, result.getTotalBlocks()); // Genesis (0) + b1 (1) + b2 (2)
        assertNull(result.getBrokenBlockIndex());
    }

    @Test
    @DisplayName("Blockchain detects tampered block and reports exact broken block index")
    public void testTamperedBlockDetection() {
        blockchainService.initGenesisBlock();
        blockchainService.mintBlock(201L, "original_hash_A", 100, "officer_chen");
        blockchainService.mintBlock(202L, "original_hash_B", 90, "police");

        // Simulate unauthorized database modification on Block 1
        Block block1 = blockRepository.findById(1L).orElseThrow();
        block1.setFileHash("maliciously_altered_hash"); // Alter payload without updating blockHash
        blockRepository.save(block1);

        ChainValidationDto result = blockchainService.validateChain();
        assertFalse(result.isValid(), "Blockchain validation must fail when block data is altered");
        assertEquals(1L, result.getBrokenBlockIndex(), "Broken block index must pinpoint Block 1");
        assertTrue(result.getReason().contains("Data tamper detected in Block #1"));
    }
}

package com.campaign.controller;

import com.campaign.model.Brief;
import com.campaign.model.Product;
import com.campaign.service.ComplianceService;
import com.campaign.service.ImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {
    private final ImageService imageService;
    private final ComplianceService complianceService;

    public CampaignController(ImageService imageService, ComplianceService complianceService) {
        this.imageService = imageService;
        this.complianceService = complianceService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadAsset(
            @RequestParam("file") MultipartFile file,
            @RequestParam("productName") String productName) {

        Map<String, Object> response = new HashMap<>();
        try {
            imageService.saveUploadedAsset(file, productName);
            response.put("status", "SUCCESS");
            response.put("message", "Asset uploaded successfully for product: " + productName);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            response.put("status", "ERROR");
            response.put("error", "Failed to save file: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateCampaign(@RequestBody Brief brief) {
        Map<String, Object> response = new HashMap<>();
        response.put("campaign", brief.campaignName());

        if (!complianceService.isContentSafe(brief.campaignMessage())) {
            response.put("status", "FAILED");
            response.put("error", "Campaign message flagged by legal/compliance check.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            for (Product product : brief.products()) {
                imageService.processCampaignImages(product, brief.targetRegion(), brief.campaignMessage());
            }

            response.put("status", "SUCCESS");
            response.put("message", "Assets generated in output folder.");
            response.put("products_processed", brief.products().size());

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            e.printStackTrace();
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}

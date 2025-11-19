package com.campaign.model;

import java.util.List;

public record Brief(String campaignName,
                    List<Product> products,
                    String targetRegion,
                    String targetAudience,
                    String campaignMessage) {
}

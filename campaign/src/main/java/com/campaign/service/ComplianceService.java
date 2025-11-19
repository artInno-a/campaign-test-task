package com.campaign.service;

import org.springframework.ai.chat.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class ComplianceService {
    private final ChatClient chatClient;

    public ComplianceService(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    public boolean isContentSafe(String message) {
        String prompt = """
                You are a brand safety officer. Analyze the following marketing message: "%s".
                Return ONLY 'true' if the message is safe, non-offensive, and legally compliant.
                Return 'false' if it contains profanity, hate speech, or misleading claims.
                """.formatted(message);

        String response = chatClient.call(prompt);
        return response.toLowerCase().contains("true");
    }
}

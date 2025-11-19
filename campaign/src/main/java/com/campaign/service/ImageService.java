package com.campaign.service;

import com.campaign.model.Product;
import org.springframework.ai.image.ImagePrompt;
import org.springframework.ai.image.ImageResponse;
import org.springframework.ai.openai.OpenAiImageClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class ImageService {
    private final OpenAiImageClient imageClient;

    @Value("${app.storage.input-dir}")
    private String inputDir;

    @Value("${app.storage.output-dir}")
    private String outputDir;

    public ImageService(OpenAiImageClient imageClient) {
        this.imageClient = imageClient;
    }

    public void saveUploadedAsset(MultipartFile file, String productName) throws IOException {
        Path directory = Paths.get(inputDir);
        if (!Files.exists(directory)) {
            Files.createDirectories(directory);
        }

        Path targetPath = directory.resolve(productName + ".png");

        try (var inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
        }
        System.out.println("Uploaded asset saved to: " + targetPath.toAbsolutePath());
    }

    public void processCampaignImages(Product product, String region, String message) throws IOException {
        File existingFile = new File(inputDir + "/" + product.name() + ".png");
        BufferedImage baseImage;

        if (existingFile.exists()) {
            System.out.println("Loading existing asset for " + product.name());
            baseImage = ImageIO.read(existingFile);
        } else {
            System.out.println("Generating GenAI asset for " + product.name());
            baseImage = generateAiImage(product, region);
        }

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
        String uniqueFolderName = product.name() + "_" + timestamp;

        createVariation(baseImage, uniqueFolderName, message, 1080, 1080, "1-1");
        createVariation(baseImage, uniqueFolderName, message, 1080, 1920, "9-16");
        createVariation(baseImage, uniqueFolderName, message, 1920, 1080, "16-9");
    }

    private BufferedImage generateAiImage(Product product, String region) throws IOException {
        String promptText = String.format(
                "Professional product photography of %s, %s style. " +
                        "Context: targeted for %s region. High resolution, photorealistic, clean lighting.",
                product.name(), product.visualStyle(), region
        );

        ImageResponse response = imageClient.call(new ImagePrompt(promptText));
        String imageUrl = response.getResult().getOutput().getUrl();
        return ImageIO.read(new URL(imageUrl));
    }

    private void createVariation(BufferedImage source, String productName, String text, int w, int h, String ratioName) throws IOException {
        BufferedImage output = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = output.createGraphics();

        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, w, h);

        double scale = Math.max((double) w / source.getWidth(), (double) h / source.getHeight());
        int scaledW = (int) (source.getWidth() * scale);
        int scaledH = (int) (source.getHeight() * scale);
        int x = (w - scaledW) / 2;
        int y = (h - scaledH) / 2;

        g2d.drawImage(source, x, y, scaledW, scaledH, null);

        addLogoOverlay(g2d, w, h);

        addTextOverlay(g2d, text, w, h);

        g2d.dispose();

        saveImage(output, productName, ratioName);
    }

    private void addLogoOverlay(Graphics2D g2d, int canvasWidth, int canvasHeight) {
        try {
            File logoFile = new File(inputDir + "/logo.png");
            if (!logoFile.exists()) {
                return;
            }

            BufferedImage logo = ImageIO.read(logoFile);

            int targetWidth = (int) (canvasWidth * 0.15);
            if (targetWidth < 50) targetWidth = 50;

            double aspectRatio = (double) logo.getHeight() / logo.getWidth();
            int targetHeight = (int) (targetWidth * aspectRatio);

            int padding = (int) (canvasWidth * 0.05);
            int x = canvasWidth - targetWidth - padding;
            int y = padding;

            g2d.drawImage(logo, x, y, targetWidth, targetHeight, null);

        } catch (Exception e) {
            System.out.println("Warning: Could not add logo overlay: " + e.getMessage());
        }
    }

    private void addTextOverlay(Graphics2D g2d, String text, int width, int height) {
        int fontSize = width / 20;
        g2d.setFont(new Font("Arial", Font.BOLD, fontSize));
        FontMetrics fm = g2d.getFontMetrics();

        int textWidth = fm.stringWidth(text);
        int textX = (width - textWidth) / 2;
        int textY = height - (height / 10);

        g2d.setColor(Color.BLACK);
        g2d.drawString(text, textX + 2, textY + 2);

        g2d.setColor(Color.WHITE);
        g2d.drawString(text, textX, textY);
    }

    private void saveImage(BufferedImage image, String productName, String ratio) throws IOException {
        Path path = Paths.get(outputDir, productName, ratio);
        Files.createDirectories(path);
        File outputFile = path.resolve("campaign_asset.png").toFile();
        ImageIO.write(image, "png", outputFile);
        System.out.println("Saved: " + outputFile.getAbsolutePath());
    }
}

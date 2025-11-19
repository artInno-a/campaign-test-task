# Creative Automation Pipeline (PoC)

## Overview

This project is a Proof-of-Concept (PoC) for a **Creative Automation Pipeline**. It helps marketing teams scale social ad campaigns by automating the creation of localized visual assets.

The system accepts a campaign brief, validates brand safety using GPT, and generates visual assets using **OpenAI's DALL-E 3**. It automatically resizes assets into standard social formats (Square, Story, Landscape) and overlays campaign messaging. Crucially, it prioritizes **reusing existing brand assets** (uploaded by the user) to save costs and ensure consistency, falling back to GenAI only when necessary.

### Tech Stack

* **Backend:** Java 17, Spring Boot 3.2, Spring AI, Java 2D Graphics.
* **Frontend:** React, Tailwind CSS, Lucide Icons.
* **AI Models:** OpenAI GPT-4 (Compliance) & DALL-E 3 (Image Generation).

-----

## Prerequisites

* **Java 17+** installed.
* **Node.js (v16+) & npm** installed.
* **OpenAI API Key** (with active credits).

-----

## 🚀 How to Run

### Part 1: Backend (Spring Boot)

1.  **Navigate to the backend directory** (where `pom.xml` is located).
2.  **Set your OpenAI API Key**:
    * *Windows (PowerShell):* `$env:OPENAI_API_KEY="sk-your-key-here"`
    * *Mac/Linux:* `export OPENAI_API_KEY=sk-your-key-here`
3.  **Run the application**:
    ```bash
    mvn spring-boot:run
        *The server will start on `http://localhost:8080`. It will automatically create `assets/input` and `assets/output` folders in your working directory.*

### Part 2: Frontend (React)

1.  **Navigate to the frontend directory** (e.g., `creative-automation-ui`).
2.  **Install dependencies**:
    ```bash
    npm install
    3.  **Start the UI**:
    ```bash
    npm start
        *The application will open at `http://localhost:3000`.*

-----

## 📖 User Guide & Workflow

### 1. Uploading Existing Assets (Cost Saving)

To prevent generating new images for products you already have, use the **"Upload Assets"** tab in the UI.

* **Action:** Upload a PNG file and provide the exact **Product Name** (e.g., `Citrus_Spark_Soda`).
* **Result:** The file is saved to `./assets/input/Citrus_Spark_Soda.png`.
* **Logic:** When you run a campaign for "Citrus_Spark_Soda", the system detects this file and skips DALL-E generation.

### 2. Adding a Company Logo (Branding)

You can automatically apply a company logo to all generated assets.

* **Action:** Go to the **"Upload Assets"** tab.
* **Product Name:** Enter exactly `logo` (lowercase).
* **File:** Upload your logo image (PNG with transparency recommended).
* **Result:** The system saves `assets/input/logo.png`.
* **Effect:** This logo will be overlaid on the **top-right corner** (scaled to 15% of width) of every generated image.

### 3. Generating a Campaign

Go to the **"Generate Campaign"** tab and fill in the brief.

* **Compliance Check:** The system first checks your `Campaign Message`. If it violates brand safety (profanity/hate speech), the process stops.
* **Generation:**
    * If an asset exists in `assets/input`, it is loaded.
    * If not, DALL-E 3 generates a new image based on the product description and visual style.
* **Processing:** The system creates 3 variations (1:1, 9:16, 16:9) with the text overlay and logo (if present).

-----

## 📂 Example Input & Output

### Input (JSON via Frontend)

```json
{
  "campaignName": "Summer Refresh",
  "targetRegion": "Japan",
  "campaignMessage": "Refresh Your World",
  "products": [
    {
      "name": "Citrus_Spark_Soda",
      "description": "Lemon-lime sparkling drink",
      "visualStyle": "Neon, Cyberpunk"
    }
  ]
}

### Output (File Structure)

After processing, check the `assets/output` folder. Each run creates a timestamped folder to preserve history:

```text
assets/
├── input/
│   ├── Citrus_Spark_Soda.png   <-- (Uploaded Product)
│   └── logo.png                <-- (Uploaded Logo)
└── output/
    └── Citrus_Spark_Soda_2025-11-19_14-30-00/  <-- (Timestamped Folder)
        ├── 1-1/
        │   └── campaign_asset.png  (1080x1080)
        ├── 9-16/
        │   └── campaign_asset.png  (1080x1920)
        └── 16-9/
            └── campaign_asset.png  (1920x1080)

-----

## Troubleshooting

**"Tailwind CSS" errors in Frontend:**
If you see build errors regarding Tailwind, ensure you installed the compatible version:
```bash
npm install -D tailwindcss@3.4.1 postcss autoprefixer

**"401 Unauthorized" in Backend:**
Check your `OPENAI_API_KEY`. If using PowerShell, set it via `$env:OPENAI_API_KEY="sk-..."`.

**"MaxUploadSizeExceededException":**
If uploading large files fails, ensure `spring.servlet.multipart.max-file-size` is set to 10MB in `application.properties`.
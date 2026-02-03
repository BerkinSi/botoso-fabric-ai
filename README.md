# Fabric AI Generator

Apply fabric textures to furniture images using AI-powered image generation with ControlNet and IP-Adapter.

## Features

- Upload a base couch image (structural reference)
- Upload a fabric texture (style reference)
- Generate a new image with the fabric applied to the couch
- Mobile-first responsive design
- Download generated results

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Copy the example environment file and add your Replicate API token:

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your token:

   ```
   REPLICATE_API_TOKEN=your_token_here
   ```

   Get your API token from [Replicate](https://replicate.com/account/api-tokens).

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Open the app:**

   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **AI:** Replicate SDK with ControlNet

## How It Works

1. The couch image is processed through ControlNet's canny edge detection to preserve the furniture's structure
2. The fabric texture is used as a style reference via IP-Adapter
3. The AI model generates a new image combining the couch structure with the fabric texture

import Replicate from "replicate";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { couchImage, fabricImage } = await request.json();

    if (!couchImage || !fabricImage) {
      return NextResponse.json(
        { error: "Both couch and fabric images are required" },
        { status: 400 }
      );
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "Replicate API token not configured" },
        { status: 500 }
      );
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Using usamaehsan/controlnet-x-ip-adapter-realistic-vision-v5 which combines:
    // - ControlNet (canny): Preserves structure from the couch image
    // - IP-Adapter: Transfers texture/style from the fabric image
    const output = await replicate.run(
      "usamaehsan/controlnet-x-ip-adapter-realistic-vision-v5:7e68116d1d2cc0efa9013d9010f663e7fc6ca53ea6442bf5c56d30cc7a3833cd",
      {
        input: {
          prompt: "a couch with beautiful fabric upholstery, photorealistic, high quality interior photography, detailed fabric texture, professional furniture photo",
          negative_prompt: "blurry, low quality, distorted, deformed, ugly, cartoon, drawing, painting, sketch, anime",
          image: couchImage,
          ip_adapter_image: fabricImage,
          controlnet_type: "canny",
          controlnet_conditioning_scale: 0.8,
          ip_adapter_weight: 0.8,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          seed: 0,
        },
      }
    );

    // Handle different response formats from Replicate
    let imageUrl: string;
    if (Array.isArray(output)) {
      imageUrl = output[0] as string;
    } else if (typeof output === "string") {
      imageUrl = output;
    } else {
      throw new Error("Unexpected response format from Replicate");
    }

    return NextResponse.json({ image: imageUrl });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    );
  }
}

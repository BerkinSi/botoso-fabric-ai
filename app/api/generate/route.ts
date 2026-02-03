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

    // OPTIMIZED: Using IP-Adapter Plus + Tile ControlNet for best results
    // - Tile ControlNet: Preserves texture details and structure (better than canny)
    // - IP-Adapter Plus: Superior style/texture transfer from fabric image
    const output = await replicate.run(
      "usamaehsan/controlnet-x-ip-adapter-realistic-vision-v5:7e68116d1d2cc0efa9013d9010f663e7fc6ca53ea6442bf5c56d30cc7a3833cd",
      {
        input: {
          prompt: "the same couch with new fabric upholstery, exact same shape and proportions, fabric texture applied to furniture, photorealistic interior photography, high quality, sharp details",
          negative_prompt: "different couch, different shape, distorted, deformed, blurry, low quality, cartoon, drawing, painting, sketch, anime, extra furniture, missing parts",
          image: couchImage,
          ip_adapter_image: fabricImage,
          ip_adapter_ckpt: "ip-adapter-plus_sd15.bin",
          controlnet_type: "tile",
          controlnet_conditioning_scale: 1.1,
          ip_adapter_weight: 0.85,
          num_inference_steps: 35,
          guidance_scale: 7,
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

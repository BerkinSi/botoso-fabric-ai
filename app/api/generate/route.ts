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

    // Using fofr/sdxl-controlnet-ip-adapter which properly combines:
    // - ControlNet (canny): Preserves structure from the couch image
    // - IP-Adapter: Transfers texture/style from the fabric image
    const output = await replicate.run(
      "fofr/sdxl-controlnet-ip-adapter:6c59535d7425eac1483ce7dbb00523a68fb5e95816f2ca32b22b172f5ca59eea",
      {
        input: {
          prompt: "a couch with beautiful upholstery fabric, photorealistic, high quality, detailed texture, professional interior photography",
          negative_prompt: "blurry, low quality, distorted, deformed, ugly, bad anatomy",
          control_image: couchImage,
          ip_adapter_image: fabricImage,
          controlnet_conditioning_scale: 0.8,
          ip_adapter_scale: 0.8,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          seed: -1,
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

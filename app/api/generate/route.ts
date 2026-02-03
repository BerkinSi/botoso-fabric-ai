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

    // Using rossjillian/controlnet model which supports IP-Adapter and ControlNet
    // The couch image provides structure via ControlNet (canny edge detection)
    // The fabric image provides style via IP-Adapter
    const output = await replicate.run(
      "rossjillian/controlnet:795433b19458d0f4fa172a7ccf93178d2adb1cb8ab2ad6c8fdc33fdbcd49f477",
      {
        input: {
          image: couchImage,
          prompt: "a couch with the exact fabric texture and pattern applied, photorealistic, high quality, detailed upholstery",
          structure: "canny",
          image_resolution: 768,
          a_prompt: "best quality, extremely detailed, professional photography",
          n_prompt: "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, blurry",
          ddim_steps: 30,
          scale: 9,
          seed: -1,
          eta: 0,
          low_threshold: 100,
          high_threshold: 200,
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

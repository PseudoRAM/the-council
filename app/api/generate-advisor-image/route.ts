import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { generateImage } from "@/utils/images/generate-image";

// Configure fal client with API key
fal.config({
  credentials: process.env.FAL_API_KEY,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { error: "Name parameter is required" },
        { status: 400 }
      );
    }

    if (!process.env.FAL_API_KEY) {
      throw new Error('FAL_API_KEY is not configured')
    }

    const imageUrl = await generateImage(name);

    // Return the image URL in the response
    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error("Image generation error:", error);
    
    // More detailed error response
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('not configured') ? 500 : 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

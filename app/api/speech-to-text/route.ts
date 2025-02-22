import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req: Request) {
  const body = await req.json();
  const base64Audio = body.audio;
  const audio = Buffer.from(base64Audio, "base64");

  try {
    const data = await openai.audio.transcriptions.create({
      file: new File([audio], "audio.wav", { type: "audio/wav" }),
      model: "whisper-1",
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.error();
  }
}

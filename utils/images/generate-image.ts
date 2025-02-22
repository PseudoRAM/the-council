"use server";

import { fal } from "@fal-ai/client";

export const generateImage = async (name: string) => {
  const result = await fal.subscribe("fal-ai/flux-lora", {
    input: {
      prompt: `Headshot of ${name}. High-quality, realistic.`,
      image_size: "portrait_4_3",
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: false,
      output_format: "jpeg",
    },
    logs: true,
  });

  if (!result.data.images[0]) {
    throw new Error("Failed to generate image");
  }

  return result.data.images[0].url;
};

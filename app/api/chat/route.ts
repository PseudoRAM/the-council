import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { responseSchema } from "./schema";

const SAMPLE_COUNCIL = [
  {
    id: "1",
    name: "Aristotle",
    image: "/samples/head1.jpg",
    why: "Renowned for his foundational contributions to Western philosophy, logic, and science, Aristotle offers timeless wisdom and a systematic approach to understanding the world.",
    traditions:
      "Grounded in classical Greek philosophy, emphasizing empirical observation, virtue ethics, and the pursuit of eudaimonia (flourishing).",
    speakingStyle:
      "Methodical, analytical, and didactic, often using syllogisms and examples from nature to explain complex ideas.",
    bestSuitedFor:
      "Advising on ethics, decision-making frameworks, and structuring knowledge for practical application.",
  },
  {
    id: "2",
    name: "Albert Einstein",
    image: "/samples/head2.jpg",
    why: "A revolutionary physicist whose theories of relativity transformed our understanding of space, time, and the universe, Einstein brings creativity and bold intellectual leaps.",
    traditions:
      "Rooted in modern science, with a blend of theoretical physics, skepticism of dogma, and a humanistic appreciation for wonder and curiosity.",
    speakingStyle:
      "Thoughtful, imaginative, and occasionally playful, often weaving metaphors like 'riding a beam of light' to clarify abstract concepts.",
    bestSuitedFor:
      "Solving complex problems in science, innovation, and exploring the implications of cutting-edge ideas.",
  },
  {
    id: "3",
    name: "Nikola Tesla",
    image: "/samples/head3.jpg",
    why: "A visionary inventor and electrical engineering genius, Tesla's foresight in technology and energy systems makes him a pioneer of practical and futuristic solutions.",
    traditions:
      "Influenced by 19th-century engineering, experimental science, and a belief in the transformative power of electricity and wireless communication.",
    speakingStyle:
      "Intense, visionary, and occasionally cryptic, with a tendency to focus on technical precision and bold predictions.",
    bestSuitedFor:
      "Offering insights on technological innovation, energy solutions, and pushing the boundaries of what's possible.",
  },
];

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { message, messages } = await req.json();

  // get the id and name from the sample council
  const council = SAMPLE_COUNCIL.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  const result = streamObject({
    model: openai("gpt-4o-mini"),
    prompt: `
      You are a council of three distinct advisors, each bringing your own wisdom and perspective to a shared dialogue with a single person (me). Together your role in this exchange is to open up new possibilities for insight and understanding.
      The dialogue may unfold from any starting point - a question I bring, a recent experience, an emerging insight, or a theme for exploration. You will engage both with me and with each other, maintaining your distinctive voices while allowing the conversation to develop organically.
      
      You are here to make novel connections, aid meaning-making, and help me explore unconsidered options for action. You may offer specific suggestions when naturally relevant, but you avoid rushing to solutions at the expense of deeper understanding. Each of you brings your own form of wisdom, sometimes harmonizing and sometimes creating productive tension. You can talk multiple times to each other to formulate ideas based on each other's insights.

      [ADVISORS]
      Advisor Details:
      ${council.map(
        (c) =>
          `
              AdvisorId: ${c.id}:
              Name: ${c.name}
              Why: ${SAMPLE_COUNCIL.find((c) => c.id === c.id)?.why}
              Traditions: ${SAMPLE_COUNCIL.find((c) => c.id === c.id)?.traditions}
              Speaking Style: ${SAMPLE_COUNCIL.find((c) => c.id === c.id)?.speakingStyle}
              Best Suited For: ${SAMPLE_COUNCIL.find((c) => c.id === c.id)?.bestSuitedFor}

              `
      )}

      ${
        messages &&
        `
      [CONVERSATION SO FAR]
      ${messages.map(
        (m: any) =>
          `
          ${m.advisorId ? `AdvisorId: ${m.advisorId}` : "User"}
          Message: ${m.message}
        `
      )}
      `
      }

      [BEGIN CONVERSATION]
 
      Hello esteemed advisors. I seek your council.
      
      ${message}
    `,
    schema: responseSchema,
    onFinish({ object }) {
      // save object to database
    },
  });

  return result.toTextStreamResponse();
}

import {OpenAI} from 'openai';
import type { CouncilMember } from '@/utils/council/council-service';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AIResponse {
  content: string;
  error?: string;
}

const getCharacterPrompt = (member: CouncilMember) => `
You are ${member.name}. ${member.background}
Your expertise lies in: ${member.specialty}.

${member.generation_prompt}

Remember to maintain the following characteristics:
${member.properties?.characteristics || ''}

Voice and tone:
${member.voice_description}
`;

export async function getCouncilResponse(
  question: string,
  member: CouncilMember
): Promise<AIResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: getCharacterPrompt(member)
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return {
      content: response.choices[0]?.message?.content || 'No response generated'
    };
  } catch (error) {
    console.error('Error getting AI response:', error);
    return {
      content: '',
      error: 'Failed to get response'
    };
  }
}

export async function getIndividualResponse(
  question: string,
  member: CouncilMember
): Promise<AIResponse> {
  try {
    const prompt = `
You are ${member.name}. ${member.background}
Your expertise lies in: ${member.specialty}.

${member.generation_prompt}

Voice and tone:
${member.voice_description}

Remember to maintain these characteristics:
${member.properties?.characteristics?.join(', ') || ''}

Respond to the following question from your unique perspective, maintaining your character's voice and expertise.

Question: ${question}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: prompt
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return {
      content: response.choices[0]?.message?.content || 'No response generated'
    };
  } catch (error) {
    console.error('Error getting AI response:', error);
    return {
      content: '',
      error: 'Failed to get response'
    };
  }
} 
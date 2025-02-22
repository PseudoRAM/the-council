// app/api/generate-advisors/route.ts
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AdvisorResponse } from '@/app/types/advisor';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
}

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionnaireData } = body;

    // Format questionnaire data into a readable string
    const formattedQuestionnaire = questionnaireData.map((section: any) => {
      const responses = section.responses
        .map((r: any) => `Q: ${r.question}\nA: ${r.answer}`)
        .join('\n\n');
      
      return `### ${section.section}\n\n${responses}`;
    }).join('\n\n');

    // Construct the prompt
    const prompt = `You are an intelligence gifted in reading a person's patterns and values and identifying what will benefit their growth and understanding.

Attached is a worksheet I've filled out with information about myself. Read the worksheet, think carefully about what it reveals, and assemble a list of 10 potential advisors you think I would benefit from having an extended conversation with.

There are no formal limits on advisor suggestions:
- They can be real people or inspired by real people
- They can be fictional characters
- They can be archetypal
- Or something stranger

Please generate a mix of the above types.

We will work together to evaluate these options and narrow them down until we have a panel of three advisors. The overall point is for me to leave this conversation with a set of three advisors I can instantiate as perspectival voices in a separate conversation with you.

Ideally the set should be well-balanced and afford multiple ways of knowing and being.

For each advisor you suggest, give a brief explanation of why you think they might be a good match.

Before naming the advisors, you may write out any patterns you observe in the worksheet that might be helpful for us in this process.

When that is done I will ask for a final listing of the advisors. This will include:
- Name
- Title
- Specific intellectual, philosophical or wisdom traditions or concepts that they embody
- Their unique voice and speaking style
- The exact types of problems they are most suited to solving

Here is the worksheet:

${formattedQuestionnaire}

Your response MUST be formatted as a valid JSON object with the following structure:
{
  "initialJustification": "A paragraph identifying key patterns from the worksheet",
  "advisors": [
    {
      "name": "Advisor Name",
      "type": "historical|archetypal|fictional|personal",
      "why": "Explanation of why this advisor would be beneficial"
    }
  ],
  "followUp": "A question about exploring or narrowing down the advisors"
}
  `;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Parse the text content from the response
    const advisorsData = JSON.parse(response.content[0].type === "text" ? response.content[0].text : "");
    console.log('Generated Advisors Response:', advisorsData);
    return NextResponse.json(advisorsData);

  } catch (error) {
    console.error('Error in generate-advisors route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
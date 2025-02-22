// app/api/generate-advisors/route.ts
import { NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
}

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

${formattedQuestionnaire}`;

    // Call Anthropic API
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Failed to generate advisors' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in generate-advisors route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
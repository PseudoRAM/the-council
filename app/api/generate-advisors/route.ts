// app/api/generate-advisors/route.ts
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AdvisorResponse } from '@/app/types/advisor';
import { createClient } from '@/utils/supabase/server';

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

    if (!questionnaireData || !Array.isArray(questionnaireData)) {
      return NextResponse.json(
        { error: 'Invalid questionnaire data format' },
        { status: 400 }
      );
    }

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
      "description": "A short description of the advisor",
      "type": "historical|archetypal|fictional|current",
      "why": "Explanation of why this advisor would be beneficial",
      "traditions": "the traditions or concepts that the advisor embodies",
      "speakingStyle": "the voice and speaking style of the advisor",
      "bestSuitedFor": "the problems the advisor is most suited to solve"
    }
  ],
  "followUp": "A question about exploring or narrowing down the advisors"
}
  `;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    if (!response.content[0] || response.content[0].type !== 'text') {
      return NextResponse.json(
        { error: 'No response content from AI' },
        { status: 500 }
      );
    }

    // Parse the text content from the response
    try {
      const advisorsData: AdvisorResponse = JSON.parse(
        response.content[0]?.type === 'text' ? response.content[0].text : '{}'
      );
      
      if (!advisorsData.advisors || !Array.isArray(advisorsData.advisors)) {
        return NextResponse.json(
          { error: 'Invalid advisor data format' },
          { status: 500 }
        );
      }
      
      // Add database operations
      const supabase = await createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return NextResponse.json({ 
          error: 'Unauthorized' 
        }, { status: 401 });
      }
      
      const councilMembers = advisorsData.advisors.map((advisor: any) => ({
        user_id: user.id,
        name: advisor.name,
        character_type: advisor.type,
        reason: advisor.why,
        description: advisor.description,
        properties: {
          traditions: advisor.traditions,
          speakingStyle: advisor.speakingStyle,
          bestSuitedFor: advisor.bestSuitedFor
        }
      }));

      const { data: insertedMembers, error: dbError } = await supabase
        .from('council_members')
        .insert(councilMembers)
        .select();

      if (dbError) {
        console.error('Database insertion error:', dbError);
        return NextResponse.json(
          { error: 'Failed to save advisors' },
          { status: 500 }
        );
      }

      // Return both the AI response and the inserted database rows
      console.log('council members', insertedMembers, advisorsData)
      return NextResponse.json({
        ...advisorsData,
        councilMembers: insertedMembers
      });
    } catch (parseError) {
      console.error('JSON Parse Error:', 
        response.content[0]?.type === 'text' ? response.content[0].text : 'No text content'
      );
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in generate-advisors route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
// app/api/generate-advisors/route.ts
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AdvisorResponse } from '@/app/types/advisor';
import { createClient } from '@/utils/supabase/server';
import { generateImage } from '@/utils/images/generate-image';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
}

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    console.log('=== Starting POST request ===');
    
    // Log request body
    const body = await request.json();
    console.log('Request body:', {
      hasQuestionnaireData: !!body.questionnaireData,
      dataLength: body.questionnaireData?.length
    });

    const { questionnaireData } = body;

    if (!questionnaireData || !Array.isArray(questionnaireData)) {
      console.error('Invalid questionnaire data:', questionnaireData);
      return NextResponse.json(
        { error: 'Invalid questionnaire data format' },
        { status: 400 }
      );
    }

    // Log formatted questionnaire
    const formattedQuestionnaire = questionnaireData.map((section: any) => {
      const responses = section.responses
        .map((r: any) => `Q: ${r.question}\nA: ${r.answer}`)
        .join('\n\n');
      
      return `### ${section.section}\n\n${responses}`;
    }).join('\n\n');

    console.log('=== Formatted Questionnaire ===');
    console.log(formattedQuestionnaire.slice(0, 200) + '...');

    // Construct the prompt
    const prompt = `You are an intelligence gifted in reading a person's patterns and values and identifying what will benefit their growth and understanding.

Attached is a series of responses I've filled out with information about myself. Read the questions and answers, think carefully about what it reveals, and assemble a list of 10 potential advisors you think I would benefit from having an extended conversation with.

There are no formal limits on advisor suggestions:
- They can be real people or inspired by real people
- They can be fictional characters
- They can be archetypal
- Or something stranger

Please generate a mix of the above types.

We will work together to evaluate these options and narrow them down until we have a panel of three advisors. The overall point is for me to leave this conversation with a set of three advisors I can instantiate as perspectival voices in a separate conversation with you.

Ideally the set should be well-balanced and afford multiple ways of knowing and being.

For each advisor you suggest, give a brief explanation of why you think they might be a good match.

Before naming the advisors, you may write out any patterns you observe in the responses that might be helpful for us in this process.

When that is done I will ask for a final listing of the advisors. This will include:
- Name
- Title
- Specific intellectual, philosophical or wisdom traditions or concepts that they embody
- Their unique voice and speaking style
- The exact types of problems they are most suited to solving

Here is the responses:

${formattedQuestionnaire}

Your response MUST be formatted as a valid JSON object with the following structure:
{
  "initialJustification": "2 sentences identifying key patterns about the user. Start with 'You are...' and then describe the key patterns you observe.",
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

    // Log Claude request
    console.log('=== Making Claude Request ===');
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      // model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    console.log('=== Claude Response ===');
    console.log('Response structure:', {
      hasContent: !!response.content,
      contentLength: response.content?.length,
      firstContentType: response.content?.[0]?.type
    });

    if (!response.content[0] || response.content[0].type !== 'text') {
      console.error('Invalid response format:', response);
      return NextResponse.json(
        { error: 'No response content from AI' },
        { status: 500 }
      );
    }

    // Parse response
    console.log('=== Parsing Response ===');
    try {
      const rawText = response.content[0].text;
      console.log('Raw text first 100 chars:', rawText.slice(0, 100));
      console.log('Raw text last 100 chars:', rawText.slice(-100));

      const advisorsData: AdvisorResponse = JSON.parse(rawText);
      
      console.log('Successfully parsed JSON:', {
        hasInitialJustification: !!advisorsData.initialJustification,
        advisorsCount: advisorsData.advisors?.length,
        hasFollowUp: !!advisorsData.followUp
      });

      if (!advisorsData.advisors || !Array.isArray(advisorsData.advisors)) {
        console.error('Invalid advisor data structure:', advisorsData);
        return NextResponse.json(
          { error: 'Invalid advisor data format' },
          { status: 500 }
        );
      }

      // Generate images for each advisor
      const images = await Promise.all(advisorsData.advisors.map(async (advisor: any) => {
        const imageUrl = await generateImage(advisor.name);
        return {
          name: advisor.name,
          imageUrl: imageUrl
        };
      }));  

      
      // Add database operations
      const supabase = await createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return NextResponse.json({ 
          error: 'Unauthorized' 
        }, { status: 401 });
      }
      
      const councilMembers = advisorsData.advisors.map((advisor: any) => {
        // Find the matching image for this advisor
        const advisorImage = images.find(img => img.name === advisor.name);
        
        return {
          user_id: user.id,
          name: advisor.name,
          character_type: advisor.type,
          reason: advisor.why,
          description: advisor.description,
          image_url: advisorImage?.imageUrl || null, // Add the image URL to the database record
          properties: {
            traditions: advisor.traditions,
            speakingStyle: advisor.speakingStyle,
            bestSuitedFor: advisor.bestSuitedFor
          }
        };
      });

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

      // Call populate-extra-data to generate descriptions and voices
      console.log('=== Calling populate-extra-data ===');
      try {
        const populateResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/populate-extra-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!populateResponse.ok) {
          const errorData = await populateResponse.json().catch(() => ({}));
          console.error('Failed to populate extra data:', errorData);
        } else {
          const populateResult = await populateResponse.json();
          console.log('Successfully populated extra data:', populateResult);
        }
      } catch (populateError) {
        console.error('Error calling populate-extra-data:', populateError);
        // Don't fail the whole request if population fails
      }

      // Return both the AI response and the inserted database rows
      console.log('council members', insertedMembers, advisorsData);
      return NextResponse.json({
        ...advisorsData,
        councilMembers: insertedMembers
      });
    } catch (parseError) {
      console.error('=== JSON Parse Error ===');
      console.error('Error details:', parseError);
      console.error('Raw text that failed to parse:', 
        response.content[0].text
      );
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response',
          details: parseError instanceof Error ? parseError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('=== Route Error ===');
    console.error('Error details:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
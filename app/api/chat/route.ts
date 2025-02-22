import { createClient } from '@/utils/supabase/server'
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { responseSchema, CouncilMember } from "./schema";
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Initialize Supabase client
    const supabase = await createClient();

    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch active council members for the current user
    const { data: councilMembers, error: fetchError } = await supabase
      .from('council_members')
      .select('id, name, image_url, reason, description, character_type')
      .eq('user_id', session.user.id)
      .eq('is_active', true);

    if (fetchError) {
      console.error('Error fetching council members:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch council members' }, { status: 500 });
    }

    if (!councilMembers || councilMembers.length === 0) {
      return NextResponse.json({ error: 'No active council members found' }, { status: 404 });
    }

    // Get message data from request
    const { message, messages } = await req.json();

    // Map council members to the format needed for the prompt
    const council = councilMembers.map((member) => ({
      id: member.id,
      name: member.name,
      description: member.description || '',
      character_type: member.character_type || '',
      reason: member.reason || '',
    }));

    const { data: userSurveyResponse, error: userSurveyResponseError } = await supabase
      .from('user_survey_responses')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    const result = streamObject({
      model: openai("gpt-4o-mini"),
      prompt: `
        You are a council of advisors, each bringing your own wisdom and perspective to a shared dialogue with a single person (me). Together your role in this exchange is to open up new possibilities for insight and understanding.
        The dialogue may unfold from any starting point - a question I bring, a recent experience, an emerging insight, or a theme for exploration. You will engage both with me and with each other, maintaining your distinctive voices while allowing the conversation to develop organically.
        
        You are here to make novel connections, aid meaning-making, and help me explore unconsidered options for action. You may offer specific suggestions when naturally relevant, but you avoid rushing to solutions at the expense of deeper understanding.

        Here is the user's survey response that provides more context about who they are and what they are seeking:
        ${userSurveyResponse?.response || ''}

        [ADVISORS]
        Advisor Details:
        ${council.map(
          (c) =>
            `
            AdvisorId: ${c.id}
            Name: ${c.name}
            Description: ${c.description}
            Type: ${c.character_type}
            Why: ${c.reason}
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
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

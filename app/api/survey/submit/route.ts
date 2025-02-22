import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { Answer } from '@/types/survey';

interface SurveyAnswers {
  answers: Record<string, Answer>;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as SurveyAnswers;
    const userId = session.user.id;
    const answers = body.answers;

    // Start a transaction to insert all responses
    const { data: responses, error } = await supabase
      .from('user_responses')
      .upsert(
        Object.entries(answers).map(([questionId, answer]) => ({
          user_id: userId,
          question_id: questionId,
          response_text: typeof answer.value === 'string' 
            ? answer.value 
            : JSON.stringify(answer.value),
          updated_at: new Date().toISOString()
        }))
      )
      .select();

    if (error) {
      console.error('Error saving responses:', error);
      return NextResponse.json(
        { error: 'Failed to save responses' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: responses });
  } catch (error) {
    console.error('Error in survey submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { formattedAnswers } = await request.json();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    console.log('User data:', user);
    
    if (userError || !user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('survey_responses')
      .insert({
        user_id: user.id,
        responses: formattedAnswers
      });

    if (error) {
      return NextResponse.json({ 
        success: false, 
        message: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error' 
    }, { status: 500 });
  }
}
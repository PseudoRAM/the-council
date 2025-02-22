import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { seedQuestions } from '@/utils/survey/seed-questions';

export async function POST(request: Request) {
  try {
    // In development, allow seeding without auth check
    if (process.env.NODE_ENV === 'development') {
      await seedQuestions();
      return NextResponse.json({ success: true });
    }

    // In production, keep the auth check
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user.email?.endsWith('@yourdomain.com')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await seedQuestions();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in seed route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
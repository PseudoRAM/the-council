// api/council/select/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { selectedAdvisors } = await request.json();
    console.log('Selected advisors:', selectedAdvisors);
    // Input validation
    if (!selectedAdvisors || !Array.isArray(selectedAdvisors)) {
      return NextResponse.json(
        { error: 'Selected advisors must be an array' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Set selected advisors to active
    const { error: updateError } = await supabase
      .from('council_members')
      .update({ is_active: true })
      .in('id', selectedAdvisors)
      .eq('user_id', user.id);  // ensures user can only update their own advisors

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update advisors' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in council select route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}


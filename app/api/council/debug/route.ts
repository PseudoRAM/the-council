import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get all council members
    const { data: allMembers, error: membersError } = await supabase
      .from('council_members')
      .select('*');

    if (membersError) {
      console.error('Error fetching all council members:', membersError);
      return NextResponse.json({ error: membersError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      count: allMembers?.length || 0,
      members: allMembers 
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
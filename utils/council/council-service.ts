import { createClient } from '@/utils/supabase/server';

export interface CouncilMember {
  id: string;
  name: string;
  specialty: string;
  background: string;
  voice_description: string;
  voice_id?: string;
  generation_prompt: string;
  properties?: {
    characteristics: string[];
  };
}

export async function getUserCouncilMembers(userId: string): Promise<CouncilMember[]> {
  console.log('Fetching council members for user:', userId);
  
  const supabase = await createClient();

  // First, log total count of council members
  const { count: totalCount } = await supabase
    .from('council_members')
    .select('*', { count: 'exact', head: true });

  console.log('Total council members in database:', totalCount);

  // Then get user's council members
  const { data, error } = await supabase
    .from('council_members')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching council members:', error);
    throw error;
  }

  console.log('Found council members for user:', {
    userId,
    count: data?.length || 0,
    members: data
  });

  return data || [];
} 
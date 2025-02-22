import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { getUserCouncilMembers } from '@/utils/council/council-service';
import CouncilChamber from '@/components/council/CouncilChamber';
import { redirect } from 'next/navigation';

export default async function CouncilPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    console.log('No session found, redirecting to login');
    redirect('/login');
  }

  console.log('User session found:', {
    userId: session.user.id,
    email: session.user.email
  });

  try {
    const councilMembers = await getUserCouncilMembers(session.user.id);
    
    console.log('Council members loaded:', {
      count: councilMembers.length,
      memberIds: councilMembers.map(m => m.id)
    });

    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Council Chamber</h1>
        
        <Suspense fallback={<div>Loading council...</div>}>
          <CouncilChamber initialCouncilMembers={councilMembers} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('Error in CouncilPage:', error);
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Council Chamber</h1>
        <div className="text-red-500">
          Error loading council members. Please try again later.
        </div>
      </div>
    );
  }
} 
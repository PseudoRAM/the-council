import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CouncilChatLayout from "@/components/chat";

interface CouncilMember {
  id: string;
  name: string;
  image_url: string | null;
  voice_id: string | null;
  user_id: string;
  is_active: boolean;
}

// Define the expected council type
interface CouncilMemberForChat {
  id: string;
  name: string;
  image: string;
  voidId: string;  // Note: this matches what CouncilChatLayout expects
}

export default async function CouncilPage() {
  const supabase = await createClient();
  
  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    console.log("No session found, redirecting to login");
    redirect("/login");
  }

  console.log("User session found:", {
    userId: session.user.id,
    email: session.user.email,
  });

  // Fetch active council members for the current user
  const { data: councilMembers, error } = await supabase
    .from('council_members')
    .select('id, name, image_url, voice_id')
    .eq('user_id', session.user.id)
    .eq('is_active', true);

  if (error) {
    console.error("Error fetching council members:", error);
    // You might want to handle this error differently
    throw error;
  }

  if (!councilMembers || councilMembers.length === 0) {
    console.log("No active council members found, redirecting to questionnaire");
    redirect("/questionnaire");
  }

  // Map the council members to the format expected by CouncilChatLayout
  const council: CouncilMemberForChat[] = councilMembers.map((member) => ({
    id: member.id,
    name: member.name,
    image: member.image_url || '/default-avatar.jpg',
    voidId: member.voice_id || '',  // Changed from voiceId to voidId to match expected type
  }));

  return <CouncilChatLayout council={council} />;
}

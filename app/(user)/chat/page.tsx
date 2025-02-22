import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CouncilChatLayout from "@/components/chat";

const SAMPLE_COUNCIL = [
  {
    id: "1",
    name: "Aristotle",
    image: "/samples/head1.jpg",
    voidId: "3mzIbiokJ9mrcCyIp1qj",
  },
  {
    id: "2",
    name: "Albert Einstein",
    image: "/samples/head2.jpg",
    voidId: "6I9Th1CC1ABILp2DL97y",
  },
  {
    id: "3",
    name: "Nikola Tesla",
    image: "/samples/head3.jpg",
    voidId: "esI5cQeAB6VkeFvzBBnK",
  },
];

export default async function CouncilPage() {
  const supabase = await createClient();
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

  return <CouncilChatLayout council={SAMPLE_COUNCIL} />;
}

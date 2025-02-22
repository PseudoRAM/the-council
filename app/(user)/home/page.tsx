import React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import QuestionnaireForm from "@/components/context-gathering/Questionnaire";

export default async function CouncilPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="pt-10 flex flex-col gap-10">
      <main className="flex-1 flex flex-col gap-6 px-4">
        <QuestionnaireForm />
      </main>
    </div>
  );
}

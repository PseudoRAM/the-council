import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import QuestionnaireForm from "@/components/context-gathering/Questionnaire";
import { Hero } from "@/components/hero";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";

export default async function Home() {
  return (
    <>
      <Hero />
      <main className="flex-1 flex flex-col gap-6 px-4">
        <QuestionnaireForm />
      </main>
    </>
  );
}

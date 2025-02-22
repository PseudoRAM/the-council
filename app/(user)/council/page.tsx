import React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { InputBento } from "@/components/bento/input";

export default async function CouncilPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <BentoGrid className="max-w-4xl mx-auto">
      <div
        className={
          "row-span-1 rounded-xl group/bento transition duration-200 shadow-input dark:shadow-none p-4  bg-white border border-transparent justify-between flex flex-col space-y-4"
        }
      >
        <InputBento />
      </div>
    </BentoGrid>
  );
}

import React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { InputBento } from "@/components/bento/input";
import { Badge } from "@/components/ui/badge";

const SAMPLE_COUNCIL = [
  {
    name: "Aristotle",
    image: "/samples/head1.jpg",
  },
  {
    name: "Albert Einstein",
    image: "/samples/head2.jpg",
  },
  {
    name: "Nikola Tesla",
    image: "/samples/head3.jpg",
  },
];

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
      <InputBento />
      <div className="flex flex-row gap-5 flex-wrap">
        {SAMPLE_COUNCIL.map((council, index) => (
          <div
            key={index}
            className="flex flex-row gap-2 border p-2 rounded-lg w-52"
          >
            <img
              src={council.image}
              alt={council.name}
              className="h-24 w-20 rounded-lg object-cover object-top flex-shrink-0"
            />
            <div className="flex flex-col w-full gap-1">
              <Badge className="w-fit ml-auto">Historical</Badge>
              <div className="text-right text-sm font-medium w-full">
                {council.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { PlaceholderInput } from "@/components/ui/placeholder-input";

export function InputBento() {
  const placeholders = [
    "How much sleep should I be having?",
    "What degree should I take?",
    "What's the meaning of life?",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
  };
  return (
    <div className="flex flex-col justify-center  items-center px-4">
      <h2 className="mb-5 sm:mb-10 text-xl text-center sm:text-5xl dark:text-white text-black">
        Ask your council anything.
      </h2>
      <PlaceholderInput
        placeholders={placeholders}
        onChange={handleChange}
        onSubmit={onSubmit}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

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

type Message = {
  id: number;
  content: string;
  sender: string;
  senderImage?: string;
  timestamp: Date;
};

export default function CouncilPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content:
        "In matters of decision, one must first examine the facts and principles at hand. What specific challenge troubles your mind?",
      sender: SAMPLE_COUNCIL[0].name,
      senderImage: SAMPLE_COUNCIL[0].image,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  // Add ref for message container
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      content: inputMessage,
      sender: "User",
      timestamp: new Date(),
    };

    // Generate 1-3 advisor responses
    const numResponses = Math.floor(Math.random() * 3) + 1;
    const advisorResponses: Message[] = [];

    const advisorReplies = [
      "Let me share my perspective on this matter...",
      "An interesting point you raise. Here's my thought...",
      "From my experience, I would suggest...",
      "This reminds me of a similar situation...",
      "Consider looking at it from this angle...",
    ];

    for (let i = 0; i < numResponses; i++) {
      const advisorIndex = (messages.length + i) % SAMPLE_COUNCIL.length;
      const randomReply =
        advisorReplies[Math.floor(Math.random() * advisorReplies.length)];

      advisorResponses.push({
        id: messages.length + 2 + i,
        content: randomReply,
        sender: SAMPLE_COUNCIL[advisorIndex].name,
        senderImage: SAMPLE_COUNCIL[advisorIndex].image,
        timestamp: new Date(),
      });
    }

    const newMessages = [...messages, userMessage, ...advisorResponses];
    setMessages(newMessages);
    setInputMessage("");
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto p-3 gap-4 h-[calc(100vh-100px)]">
      <div className="flex flex-wrap gap-2 mb-2">
        {SAMPLE_COUNCIL.map((advisor, index) => (
          <div key={index} className="relative group">
            <img
              className="w-8 h-8 rounded-lg object-top object-cover cursor-pointer hover:ring-2 hover:ring-blue-500"
              src={advisor.image}
              alt={advisor.name}
            />
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
              {advisor.name}
            </div>
          </div>
        ))}
      </div>

      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto space-y-4 scroll-smooth"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-3 ${message.sender === "User" ? "justify-end" : ""}`}
          >
            {message.sender !== "User" && (
              <img
                className="w-8 h-8 rounded-lg object-top object-cover"
                src={message.senderImage}
                alt={message.sender}
              />
            )}
            <div
              className={`flex flex-col max-w-[70%] ${message.sender === "User" ? "bg-[#e6a5ee] text-black" : "bg-gray-100"} rounded-xl ${message.sender === "User" ? "rounded-br-none" : "rounded-bl-none"} p-3 space-y-1.5`}
            >
              {message.sender !== "User" && (
                <span className="font-semibold text-gray-900 text-sm">
                  {message.sender}
                </span>
              )}
              <p className="text-gray-700 text-sm">{message.content}</p>
            </div>
            {message.sender === "User" && (
              <div className="w-8 h-8 rounded-lg object-top bg-gray-200 flex items-center justify-center text-gray-700 text-sm font-semibold">
                JS
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white p-3 border-t">
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 rounded-lg object-top border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-[#e6a5ee] text-white rounded-lg object-top p-1.5 hover:bg-[#e883f5] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

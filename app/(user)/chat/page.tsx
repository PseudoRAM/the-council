"use client";

import React, { useState, useEffect, useRef } from "react";
import { experimental_useObject } from "@ai-sdk/react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { responseSchema } from "@/app/api/chat/schema";

const SAMPLE_COUNCIL = [
  {
    id: "1",
    name: "Aristotle",
    image: "/samples/head1.jpg",
  },
  {
    id: "2",
    name: "Albert Einstein",
    image: "/samples/head2.jpg",
  },
  {
    id: "3",
    name: "Nikola Tesla",
    image: "/samples/head3.jpg",
  },
];

type Message = {
  content: string;
  senderId?: string;
};

export default function CouncilPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const { submit, isLoading, object } = experimental_useObject({
    api: "/api/chat",
    schema: responseSchema,
    onFinish({ object }) {
      if (object != null) {
        setMessages((prev) => [
          ...prev,
          ...object.messages.map((m) => ({
            content: m.message,
            senderId: m.adviserId,
          })),
        ]);
        setInputMessage("");
      }
    },
  });

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
      senderId: "user",
      content: inputMessage,
    };
    setMessages((prev) => [...prev, userMessage]);

    submit({
      message: inputMessage,
    });

    setInputMessage("");
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto p-3 gap-4 h-[calc(100vh-100px)]">
      <div className="flex flex-wrap gap-2 mb-2  w-full">
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
        className="flex-1 overflow-y-auto space-y-4 scroll-smooth w-full relative"
      >
        {isLoading && (
          <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-center">
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-[#e6a5ee] animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 rounded-full bg-[#e6a5ee] animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 rounded-full bg-[#e6a5ee] animate-bounce"></div>
            </div>
          </div>
        )}
        {[
          ...messages,
          ...(object?.messages
            ? object.messages.map((m) => ({
                content: m?.message ?? "",
                senderId: m?.adviserId,
              }))
            : []),
        ].map(
          (message, index) =>
            message?.senderId && (
              <div
                key={`message-${index}`}
                className={`flex items-end gap-3 ${message.senderId === "user" ? "justify-end" : ""}`}
              >
                {message.senderId !== "user" && (
                  <img
                    className="w-8 h-8 rounded-lg object-top object-cover"
                    src={
                      SAMPLE_COUNCIL.find((c) => c.id === message.senderId)
                        ?.image
                    }
                    alt={
                      SAMPLE_COUNCIL.find((c) => c.id === message.senderId)
                        ?.name
                    }
                  />
                )}
                <div
                  className={`flex flex-col max-w-[70%] ${message.senderId === "user" ? "bg-[#e6a5ee] text-black" : "bg-gray-100"} rounded-xl ${!!message.senderId ? "rounded-br-none" : "rounded-bl-none"} p-3 space-y-1.5`}
                >
                  {message.senderId !== "user" && (
                    <span className="font-semibold text-gray-900 text-sm">
                      {
                        SAMPLE_COUNCIL.find((c) => c.id === message.senderId)
                          ?.name
                      }
                    </span>
                  )}
                  <p className="text-gray-700 text-sm">{message.content}</p>
                </div>
                {message.senderId === "user" && (
                  <div className="w-8 h-8 rounded-lg object-top bg-gray-200 flex items-center justify-center text-gray-700 text-sm font-semibold">
                    You
                  </div>
                )}
              </div>
            )
        )}
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
            disabled={isLoading}
            className="bg-[#e6a5ee] text-white rounded-lg object-top p-1.5 hover:bg-[#e883f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

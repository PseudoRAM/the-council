"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { experimental_useObject } from "@ai-sdk/react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { responseSchema } from "@/app/api/chat/schema";
import { useRecordVoice } from "@/hooks/use-record-voice";
import { PlaceholderInput } from "@/components/ui/placeholder-input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

const PLACEHOLDER_MESSAGES = [
  "Ask the council about your challenges...",
  "Seek wisdom from historical figures...",
  "Get insights on your decisions...",
  "Explore ideas with great minds...",
];

type Message = {
  content: string;
  senderId?: string;
};

export default function CouncilPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [messageQueue, setMessageQueue] = useState<Message[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const { recording, startRecording, stopRecording, text } = useRecordVoice();

  useEffect(() => {
    if (text) {
      setInputMessage(text);
    }
  }, [text]);

  const processMessageQueue = useCallback(() => {
    if (messageQueue.length === 0) {
      setIsProcessingQueue(false);
      return;
    }

    setIsProcessingQueue(true);
    const nextMessage = messageQueue[0];

    setTimeout(() => {
      setMessageQueue((prev) => prev.slice(1));
      setIsProcessingQueue(false); // Reset processing flag after handling message
    }, 2000);
  }, [messageQueue]);

  useEffect(() => {
    if (messageQueue.length > 0 && !isProcessingQueue) {
      processMessageQueue();
    }
  }, [messageQueue, isProcessingQueue, processMessageQueue]);

  const { submit, isLoading, object } = experimental_useObject({
    api: "/api/chat",
    schema: responseSchema,
    onFinish({ object }) {
      if (object != null) {
        const newMessages = object.messages.map((m) => ({
          content: m.message,
          senderId: m.adviserId,
        }));
        setMessages((prev) => [...prev, ...newMessages]);
        setMessageQueue((prev) => [...prev, ...newMessages]);
      }
    },
  });

  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (message: string = inputMessage) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      senderId: "user",
      content: message,
    };
    setMessages([...messages, userMessage]);

    submit({
      message: message,
      messages: messages.map((m) => ({
        message: m.content,
        advisorId: m.senderId,
      })),
    });

    setInputMessage("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto p-3 gap-4 h-[calc(100vh-100px)]">
      {messages.length !== 0 && (
        <>
          <div className="flex flex-wrap gap-2 mb-2 w-full">
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
              ...((isLoading &&
                object?.messages?.map((m) => ({
                  content: m?.message,
                  senderId: m?.adviserId,
                }))) ||
                []),
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
                            SAMPLE_COUNCIL.find(
                              (c) => c.id === message.senderId
                            )?.name
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
        </>
      )}

      <div
        className={cn(
          "sticky bottom-0 bg-white p-3",
          messages.length > 0 && "border-t"
        )}
      >
        {messages.length === 0 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col justify-center items-center px-4">
              <h2 className="mb-5 sm:mb-10 text-xl text-center sm:text-5xl dark:text-white text-black">
                Ask your council anything.
              </h2>
              <PlaceholderInput
                placeholders={PLACEHOLDER_MESSAGES}
                onChange={handleInputChange}
                onSend={() => {
                  handleSendMessage(inputMessage);
                }}
              />
            </div>
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
        )}
        {messages.length > 0 && (
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
              onClick={recording ? stopRecording : startRecording}
              className={`${recording ? "bg-red-500" : "bg-gray-500"} text-white rounded-lg object-top p-1.5 hover:opacity-80 transition-colors`}
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
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
            </button>
            <button
              onClick={() => handleSendMessage()}
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
        )}
      </div>
    </div>
  );
}

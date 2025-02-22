"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AdvisorType,
  Advisor,
  AdvisorResponse,
  CouncilMember,
} from "@/app/types/advisor";
import { shortcutData } from "./shortcut";
import { AdvisorCard } from "@/components/generate-council/AdvisorCard";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Answers = {
  [key: number]: {
    section: string;
    responses: {
      [key: number]: {
        question: string;
        answer: string;
      };
    };
  };
};

type FormattedAnswer = {
  section: string;
  responses: {
    question: string;
    answer: string;
  }[];
};

const transformToFormattedData = (answers: Answers): FormattedAnswer[] => {
  return Object.entries(answers).map(([_, sectionData]) => ({
    section: sectionData.section,
    responses: Object.values(sectionData.responses),
  }));
};

const QuestionnaireForm = () => {
  const [currentSection, setCurrentSection] = useState(-1); // -1 for welcome screen
  const [showResults, setShowResults] = useState(false); // Add this new state
  const [answers, setAnswers] = useState<Answers>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advisors, setAdvisors] = useState<AdvisorResponse | null>(null);
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]);
  const router = useRouter();

  const sections = [
    {
      title: "Personal Context",
      questions: [
        "What is your current age, location, and primary occupation?",
        "What's the most significant change you're currently navigating in your life (career, relationships, personal growth, etc.)?",
      ],
    },
    {
      title: "Relationships & Social Dynamics",
      questions: [
        "Who are the three people who most energize or inspire you, and what quality in each of them resonates with you?",
        "In what social contexts or relationships do you feel most alive and authentic?",
      ],
    },
    {
      title: "Values & Identity",
      questions: [
        "Name three things (experiences, places, activities) that consistently bring you joy or satisfaction. Why?",
        "What's a strong conviction or approach to life that sets you apart from others?",
      ],
    },
    {
      title: "Inspiration & Models",
      questions: [
        "Name one real person and one fictional character you deeply resonate with. What specific qualities in each speak to you?",
        "What book, philosophy, or piece of wisdom has most shaped how you see the world and why?",
      ],
    },
    {
      title: "Growth & Aspirations",
      questions: [
        "What specific quality or capability would you most like to develop in yourself over the next year?",
        "Describe your ideal day three years from now - what would you be doing, and more importantly, who would you be being?",
      ],
    },
    {
      title: "Self-Understanding",
      questions: [
        "What's the most insightful feedback you've received about yourself from others?",
        'Complete this sentence: "People who know me well would say I\'m the kind of person who..."',
      ],
    },
  ];

  const handleAnswerChange = (
    sectionIndex: number,
    questionIndex: number,
    value: string
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [sectionIndex]: {
        section: sections[sectionIndex].title,
        responses: {
          ...prev[sectionIndex]?.responses,
          [questionIndex]: {
            question: sections[sectionIndex].questions[questionIndex],
            answer: value,
          },
        },
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentSection(-2); // Set to loading state first

      const formattedAnswers: FormattedAnswer[] =
        transformToFormattedData(answers);
      console.log("Formatted Answers:", formattedAnswers);
      await addResponsesToSupabase(formattedAnswers);
      const response = await fetch("/api/generate-advisors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionnaireData: formattedAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate advisors");
      }

      const data = await response.json();
      console.log("Generated Advisors Response:", data);
      setAdvisors(data);
      setCurrentSection(-3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCouncil = async () => {
    console.log("Creating council...", selectedAdvisors);
    setIsLoading(true);

    try {
      if (!advisors || selectedAdvisors.length === 0) {
        setError("Please select at least one advisor");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/council/select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedAdvisors,
          allAdvisors: advisors.councilMembers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create council");
      }

      // Navigate to chat page after successful council creation
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addResponsesToSupabase = async (
    formattedAnswers: FormattedAnswer[]
  ) => {
    try {
      const response = await fetch("/api/store-user-responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formattedAnswers }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save responses");
      }

      return result.data;
    } catch (err) {
      console.error("Error saving responses:", err);
      setError(err instanceof Error ? err.message : "Failed to save responses");
    }
  };

  const addAdvisorsToSupabase = async () => {};

  const handleShortcut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentSection(-2);
      const formattedAnswers: FormattedAnswer[] =
        transformToFormattedData(shortcutData);
      const responses = await addResponsesToSupabase(formattedAnswers);
      console.log("Submitting shortcut data to supabase...", responses);

      const response = await fetch("/api/generate-advisors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionnaireData: shortcutData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate advisors");
      }

      const data = await response.json();
      console.log("Generated Advisors Response:", data);
      setAdvisors(data);
      setCurrentSection(-3);
      setShowResults(true); // Show results instead of changing section
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvisorSelection = (advisorId: string) => {
    setSelectedAdvisors((prev) => {
      if (prev.includes(advisorId)) {
        return prev.filter((id) => id !== advisorId);
      } else if (prev.length < 3) {
        return [...prev, advisorId];
      }
      return prev;
    });
  };

  if (currentSection === -1) {
    return (
      <div className="space-y-8">
        <Card className="max-w-3xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Welcome to Your Personal Advisory Council
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              We'll ask you a series of questions to understand you better and
              create your personalized council of advisors.
            </p>
            <p className="text-center text-gray-600">
              Take your time with each response - the more detailed and honest
              you are, the better we can help you.
            </p>
            <div className="flex justify-center mt-6 gap-4">
              <Button
                onClick={() => setCurrentSection(0)}
                className="flex items-center gap-2"
              >
                Begin Journey <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleShortcut}
                variant="outline"
                className="flex items-center gap-2"
              >
                Shortcut
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentSection === -3) {
    return (
      <div className="space-y-8  pb-10">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Your Advisors</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  Generating your personal advisory council...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : advisors ? (
              <div>
                {/* Initial Justification */}
                <div className="mb-8">
                  <p className="text-gray-600">
                    {advisors.initialJustification}
                  </p>
                </div>

                {/* Advisors Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {advisors.councilMembers.map(
                    (member: CouncilMember, index: number) => (
                      <AdvisorCard
                        key={index}
                        advisor={{
                          id: member.id,
                          type: member.character_type,
                          name: member.name,
                          description: member.description,
                          why: member.reason,
                          traditions: member.properties.traditions,
                          speakingStyle: member.properties.speakingStyle,
                          bestSuitedFor: member.properties.bestSuitedFor,
                          imageUrl: member.image_url,
                        }}
                        isSelected={selectedAdvisors.includes(member.id)}
                        onSelect={() => handleAdvisorSelection(member.id)}
                      />
                    )
                  )}
                </div>

                {/* Follow-up Question */}
                {/*advisors.followUp && (
                  <div className="mt-8">
                    <p className="text-gray-600 italic">{advisors.followUp}</p>
                  </div>
                )*/}

                <div
                  className={`flex justify-center mt-6 ${selectedAdvisors.length >= 3 ? "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50" : ""}`}
                >
                  <Button
                    onClick={handleCreateCouncil}
                    className={cn(
                      `flex items-center transition-all bg-black text-white gap-2`,
                      selectedAdvisors.length < 3
                        ? "opacity-50 cursor-not-allowed"
                        : "bg-[#e6a5ee] text-black"
                    )}
                    disabled={isLoading || selectedAdvisors.length < 3}
                  >
                    {isLoading ? "Creating..." : "Create The Council"}
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentSection === -2) {
    return (
      <div className="space-y-8">
        <Card className="max-w-3xl mx-auto mt-8">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <h3 className="text-xl font-semibold">Finding Your Council...</h3>
              <p className="text-gray-600">
                We're carefully analyzing your responses to assemble the perfect
                advisory council for you.
              </p>
              <p className="text-sm text-gray-500">
                This usually takes about a minute.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="max-w-3xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {sections[currentSection].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sections[currentSection].questions.map((question, qIndex) => (
            <div key={qIndex} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {question}
              </label>
              <Textarea
                value={
                  answers[currentSection]?.responses?.[qIndex]?.answer || ""
                }
                onChange={(e) =>
                  handleAnswerChange(currentSection, qIndex, e.target.value)
                }
                rows={4}
                className="w-full"
                placeholder="Share your thoughts..."
              />
            </div>
          ))}

          <div className="flex justify-between mt-6">
            <Button
              onClick={() => setCurrentSection((prev) => prev - 1)}
              disabled={currentSection === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>

            {currentSection === sections.length - 1 ? (
              <Button
                onClick={handleSubmit}
                className="flex items-center gap-2"
              >
                Submit
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentSection((prev) => prev + 1)}
                className="flex items-center gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add results section */}
      {isLoading && (
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-600">
            Generating your personal advisory council...
          </p>
        </div>
      )}

      {error && (
        <div className="max-w-3xl mx-auto text-center text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default QuestionnaireForm;

"use client";

import { createContext, useContext, useReducer, useEffect } from 'react';
import type { SurveyProgress, Answer } from '@/types/survey';
import { questions } from '@/data/survey-questions';

interface SurveyState {
  progress: SurveyProgress;
  isLoading: boolean;
  error: string | null;
}

type SurveyAction = 
  | { type: 'SET_ANSWER'; payload: { questionId: string; answer: Answer } }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'LOAD_PROGRESS'; payload: SurveyProgress }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

const initialState: SurveyState = {
  progress: {
    currentStep: 0,
    totalSteps: questions.length,
    answers: {},
    completed: false,
    lastSaved: new Date(),
  },
  isLoading: false,
  error: null,
};

const SurveyContext = createContext<{
  state: SurveyState;
  dispatch: React.Dispatch<SurveyAction>;
} | undefined>(undefined);

export function SurveyProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(surveyReducer, initialState);

  useEffect(() => {
    // Load saved progress from localStorage
    const savedProgress = localStorage.getItem('surveyProgress');
    if (savedProgress) {
      dispatch({ 
        type: 'LOAD_PROGRESS', 
        payload: JSON.parse(savedProgress) 
      });
    }
  }, []);

  useEffect(() => {
    // Save progress to localStorage whenever it changes
    localStorage.setItem('surveyProgress', JSON.stringify(state.progress));
  }, [state.progress]);

  return (
    <SurveyContext.Provider value={{ state, dispatch }}>
      {children}
    </SurveyContext.Provider>
  );
}

function surveyReducer(state: SurveyState, action: SurveyAction): SurveyState {
  switch (action.type) {
    case 'SET_ANSWER': {
      // Validate that the question ID exists in our questions array
      const isValidQuestionId = questions.some(q => q.id === action.payload.questionId);
      if (!isValidQuestionId) {
        console.warn(`Attempted to save answer for invalid question ID: ${action.payload.questionId}`);
        return state;
      }

      return {
        ...state,
        progress: {
          ...state.progress,
          answers: {
            ...state.progress.answers,
            [action.payload.questionId]: action.payload.answer,
          },
          lastSaved: new Date(),
        },
      };
    }
    case 'SET_STEP':
      return {
        ...state,
        progress: {
          ...state.progress,
          currentStep: action.payload,
        },
      };
    case 'LOAD_PROGRESS':
      return {
        ...state,
        progress: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

export function useSurvey() {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurvey must be used within a SurveyProvider');
  }
  return context;
} 
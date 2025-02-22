'use server'

import { createClient } from '@/utils/supabase/server';
import { Answer } from '@/types/survey';
import { revalidatePath } from 'next/cache';
import { questions, categoryTitles } from '@/data/survey-questions';

// Define the response structure
interface QuestionResponse {
  question: string;
  answer: string;
}

interface QuestionnaireSection {
  section: string;
  responses: QuestionResponse[];
}

type QuestionnaireData = QuestionnaireSection[];

export async function submitSurvey(answers: Record<string, Answer>) {
  try {
    const supabase = await createClient();
    
    // Use getUser instead of getSession for better security
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { error: 'Please login to submit survey' };
    }

    // Group questions by category
    const questionsByCategory = questions.reduce((acc, question) => {
      const categoryTitle = categoryTitles[question.categoryId];
      const category = acc.find(cat => cat.title === categoryTitle);
      if (category) {
        category.questions.push(question);
      } else {
        acc.push({
          title: categoryTitle,
          questions: [question]
        });
      }
      return acc;
    }, [] as Array<{ title: string; questions: typeof questions }>);

    // Transform answers into the specified JSONB format
    const formattedResponses: QuestionnaireData = questionsByCategory.map(category => {
      const sectionResponses: QuestionResponse[] = category.questions
        .filter(q => answers[q.id]) // Only include answered questions
        .map(q => ({
          question: q.question,
          answer: typeof answers[q.id].value === 'string' 
            ? answers[q.id].value as string
            : JSON.stringify(answers[q.id].value)
        }));

      return {
        section: category.title,
        responses: sectionResponses
      };
    }).filter(section => section.responses.length > 0); // Remove empty sections

    // Log the formatted data
    console.log('Inserting survey response:', {
      userId: user.id,
      responses: formattedResponses
    });

    // Insert into survey_responses table
    const { data, error } = await supabase
      .from('survey_responses')
      .insert({
        user_id: user.id,
        responses: formattedResponses,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving survey response:', error);
      return { error: 'Failed to save survey response' };
    }

    // Revalidate the survey page
    revalidatePath('/survey');
    return { data };
  } catch (error) {
    console.error('Survey submission error:', error);
    return { error: 'An unexpected error occurred' };
  }
} 
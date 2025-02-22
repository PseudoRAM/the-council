import { createClient } from '@/utils/supabase/server';

// Define the structure that matches our database
interface QuestionCategory {
  id: string;
  name: string;
  description?: string;
  sequence_number: number;
  is_active: boolean;
}

interface QuestionData {
  id: string;
  category_id: string;
  question_text: string;
  sequence_number: number;
  is_active: boolean;
}

// Our predefined categories and questions
const categories: QuestionCategory[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174111',
    name: 'Initial Survey',
    description: 'Basic information gathering',
    sequence_number: 1,
    is_active: true,
  }
];

const questions: QuestionData[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    category_id: '123e4567-e89b-12d3-a456-426614174111',
    question_text: 'What is your name?',
    sequence_number: 1,
    is_active: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    category_id: '123e4567-e89b-12d3-a456-426614174111',
    question_text: 'What is your age range?',
    sequence_number: 2,
    is_active: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    category_id: '123e4567-e89b-12d3-a456-426614174111',
    question_text: 'Please describe your relevant experience',
    sequence_number: 3,
    is_active: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    category_id: '123e4567-e89b-12d3-a456-426614174111',
    question_text: 'Which areas are you interested in?',
    sequence_number: 4,
    is_active: true,
  }
];

export async function seedQuestions() {
  const supabase = await createClient();

  console.log('Starting question seeding...');

  // Insert categories first
  const { error: categoryError } = await supabase
    .from('question_categories')
    .upsert(categories, {
      onConflict: 'id',
      ignoreDuplicates: false
    });

  if (categoryError) {
    console.error('Error seeding categories:', categoryError);
    return;
  }

  // Then insert questions
  const { error: questionError } = await supabase
    .from('questions')
    .upsert(questions, {
      onConflict: 'id',
      ignoreDuplicates: false
    });

  if (questionError) {
    console.error('Error seeding questions:', questionError);
    return;
  }

  console.log('Question seeding completed successfully');
} 
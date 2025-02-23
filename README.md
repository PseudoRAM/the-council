# council.ai

council.ai is your personal AI advisory council. It creates a personalized council of advisors tailored to your unique context, challenges, and aspirations.

![Council.ai Interface](/public/readme-img.png)

## Overview

council.ai brings together LLMs, voice models, and image generation to create an immersive and personalized advisory experience. The platform generates a diverse panel of advisors - ranging from historical figures to fictional characters - each bringing their unique perspective and wisdom to help users navigate life's challenges and opportunities.

## Demo

[Demo Video](https://youtu.be/VV4KOicuIdI)

## Features

- **Personalized Council Generation**: Based on your responses to a comprehensive questionnaire, the system creates a custom panel of advisors uniquely suited to your needs
- **Interactive Conversations**: Engage in meaningful dialogue with your council through a chat interface
- **Rich Multimedia Experience**:
  - AI-generated images of your advisors using Fal AI flux-lora
  - Unique voice synthesis for each advisor using ElevenLabs Voice Design API
  - TTS API with ElevenLabs with custom voice for authentic advisor interactions
    (Note: To get around ElevenLabs voice design copyright issues (i.e. you can't mention a specific person in the prompt), we use ask Claude to generate detailed information about what a given characters voice would sound like and feed that into the voice design API)

## Tech Stack

- **Frontend**: Next.js with TypeScript
- **Backend**: Next.js API Routes
- **Database & Auth**: Supabase
- **AI Services**:
  - Anthropic Claude for advisor generation and reasoning
  - OpenAI GPT-4 for conversation
  - Whisper API for audio transcription
  - ElevenLabs for text-to-speech and voice design
  - Fal AI flux-lora for image generation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- API keys for:
  - Anthropic
  - OpenAI
  - ElevenLabs
  - Fal AI

### Environment Variables

Create a `.env.local` file with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
ELEVEN_LABS_API_KEY=your_elevenlabs_key
FAL_AI_API_KEY=your_fal_ai_key
```

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/council-ai.git
cd council-ai
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Acknowledgments

This project was made possible by the wonderful work of Andrew Blevins and Jason Gnaz with [insight-cascade](https://github.com/andrewblevins/insight-cascade/), who pioneered the original concept of using Claude to build an advisory council.

We are grateful for their innovative approach and open-source contribution that inspired this implementation.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

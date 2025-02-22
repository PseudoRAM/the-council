import AudioPlayer from "@/components/AudioPlayer";
import audioData from "@/public/output_voice_test.json";

export default function AudioPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center my-6">Audio Preview</h1>
      <AudioPlayer 
        previews={audioData.previews} 
        text={audioData.text} 
      />
    </div>
  );
} 
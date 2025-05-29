
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SpeechRecognitionProps {
  onTranscriptionComplete: (text: string) => void;
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
}

const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({
  onTranscriptionComplete,
  isRecording,
  onRecordingChange,
}) => {
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      // Check for browser support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        toast({
          title: "Speech recognition not supported",
          description: "Your browser doesn't support speech recognition. Please try Chrome or Edge.",
          variant: "destructive"
        });
        return;
      }

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const recognition = new SpeechRecognition();
      recognition.lang = 'ja-JP'; // Japanese language
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        onRecordingChange(true);
        console.log('Speech recognition started');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Transcript:', transcript);
        onTranscriptionComplete(transcript);
        toast({
          title: "Speech captured!",
          description: "Your speech has been converted to text.",
        });
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        onRecordingChange(false);
        toast({
          title: "Speech recognition error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive"
        });
      };

      recognition.onend = () => {
        onRecordingChange(false);
        console.log('Speech recognition ended');
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (error) {
      console.error('Error accessing microphone:', error);
      onRecordingChange(false);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use speech recognition.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center text-gray-500">
        <p>Speech recognition is not supported in this browser.</p>
        <p className="text-sm">Please use Chrome, Edge, or Safari for speech features.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        variant={isRecording ? "destructive" : "outline"}
        size="sm"
        className={`transition-all duration-200 ${
          isRecording ? 'animate-pulse bg-red-500 hover:bg-red-600' : ''
        }`}
      >
        {isRecording ? (
          <>
            <MicOff className="w-4 h-4 mr-2" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 mr-2" />
            Speak Japanese
          </>
        )}
      </Button>
    </div>
  );
};

export default SpeechRecognition;

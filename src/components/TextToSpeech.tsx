import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TextToSpeechProps {
  text: string;
  language: string;
  disabled?: boolean;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ text, language, disabled }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const speakText = () => {
    if (!text.trim()) {
      toast({
        title: "No text to speak",
        description: "Please translate some text first.",
        variant: "destructive"
      });
      return;
    }

    if (!('speechSynthesis' in window)) {
      toast({
        title: "Text-to-speech not supported",
        description: "Your browser doesn't support text-to-speech.",
        variant: "destructive"
      });
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map language codes to speech synthesis language codes
    const languageMap: { [key: string]: string } = {
      'en': 'en-US',
      'es': 'es-ES',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'ru': 'ru-RU',
      'zh': 'zh-CN',
      'ko': 'ko-KR',
      'hi': 'hi-IN',
      'th': 'th-TH',
      'vi': 'vi-VN',
      'nl': 'nl-NL',
      'sv': 'sv-SE',
    };

    utterance.lang = languageMap[language] || 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      toast({
        title: "Speech synthesis error",
        description: "Unable to speak the text. Please try again.",
        variant: "destructive"
      });
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <Button
      onClick={isSpeaking ? stopSpeaking : speakText}
      variant="ghost"
      size="sm"
      disabled={disabled || !text.trim()}
      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-4 h-4 mr-1" />
          Stop
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 mr-1" />
          Listen
        </>
      )}
    </Button>
  );
};

export default TextToSpeech;

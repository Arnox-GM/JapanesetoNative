
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Languages } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import TranslateButton from './TranslateButton';
import SpeechRecognition from './SpeechRecognition';
import TextToSpeech from './TextToSpeech';
import { useToast } from '@/hooks/use-toast';
import { TranslationService } from '../services/translationService';
import { MAX_TEXT_LENGTH } from '../utils/security';

const TranslationCard = () => {
  const [japaneseText, setJapaneseText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  const translateText = async () => {
    if (!japaneseText.trim()) {
      toast({
        title: "Please enter some Japanese text",
        description: "Type or paste Japanese text to translate",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    
    try {
      const result = await TranslationService.translateText(japaneseText, targetLanguage);
      
      if (result.success && result.translation) {
        setTranslatedText(result.translation);
        toast({
          title: "Translation completed!",
          description: "Your text has been successfully translated.",
        });
      } else {
        throw new Error(result.error || 'Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard!",
        description: "Text has been copied to your clipboard.",
      });
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: "Copy failed",
        description: "Unable to copy text to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleSpeechTranscription = (transcript: string) => {
    setJapaneseText(transcript);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    
    if (newText.length > MAX_TEXT_LENGTH) {
      toast({
        title: "Text too long",
        description: `Maximum ${MAX_TEXT_LENGTH} characters allowed`,
        variant: "destructive"
      });
      return;
    }
    
    setJapaneseText(newText);
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl text-gray-800">
          <Languages className="w-6 h-6 text-blue-600" />
          Japanese Translator
        </CardTitle>
        <p className="text-sm text-gray-600">Type, speak, or paste Japanese text to translate</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span className="text-lg">🇯🇵</span>
                Japanese
              </label>
              <div className="flex items-center gap-2">
                <SpeechRecognition
                  onTranscriptionComplete={handleSpeechTranscription}
                  isRecording={isRecording}
                  onRecordingChange={setIsRecording}
                />
                {japaneseText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(japaneseText)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="relative">
              <Textarea
                placeholder="ここに日本語のテキストを入力してください..."
                value={japaneseText}
                onChange={handleTextChange}
                className="min-h-[120px] text-lg border-2 border-gray-200 focus:border-blue-400 transition-colors"
                style={{ fontFamily: '"Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif' }}
                disabled={isRecording}
                maxLength={MAX_TEXT_LENGTH}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {japaneseText.length}/{MAX_TEXT_LENGTH}
              </div>
            </div>
            
            {isRecording && (
              <div className="text-center text-blue-600 text-sm animate-pulse">
                🎤 Listening for Japanese speech...
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <LanguageSelector 
                selectedLanguage={targetLanguage} 
                onLanguageChange={setTargetLanguage} 
              />
              <div className="flex items-center gap-2">
                <TextToSpeech 
                  text={translatedText} 
                  language={targetLanguage}
                  disabled={!translatedText}
                />
                {translatedText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(translatedText)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="min-h-[120px] p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              {translatedText ? (
                <p className="text-lg text-gray-800 leading-relaxed">
                  {translatedText}
                </p>
              ) : (
                <p className="text-gray-400 italic">
                  Translation will appear here...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Translate Button */}
        <div className="flex justify-center">
          <TranslateButton 
            onClick={translateText} 
            isLoading={isTranslating}
            disabled={!japaneseText.trim() || isRecording}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TranslationCard;

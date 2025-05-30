
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Languages, ArrowUpDown } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import TranslateButton from './TranslateButton';
import SpeechRecognition from './SpeechRecognition';
import TextToSpeech from './TextToSpeech';
import { useToast } from '@/hooks/use-toast';
import { TranslationService } from '../services/translationService';
import { MAX_TEXT_LENGTH } from '../utils/security';

const TranslationCard = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('ja'); // 'ja' for Japanese
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  const translateText = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Please enter some text",
        description: "Type or paste text to translate",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    
    try {
      const result = await TranslationService.translateText(sourceText, sourceLanguage, targetLanguage);
      
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

  const swapLanguages = () => {
    // Swap languages
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    
    // Swap texts
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
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
    setSourceText(transcript);
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
    
    setSourceText(newText);
  };

  const getLanguageDisplay = (langCode: string) => {
    if (langCode === 'ja') return { flag: '🇯🇵', name: 'Japanese' };
    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Spanish', flag: '🇪🇸' },
      { code: 'de', name: 'German', flag: '🇩🇪' },
      { code: 'it', name: 'Italian', flag: '🇮🇹' },
      { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
      { code: 'ru', name: 'Russian', flag: '🇷🇺' },
      { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
      { code: 'ko', name: 'Korean', flag: '🇰🇷' },
      { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
      { code: 'th', name: 'Thai', flag: '🇹🇭' },
      { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
      { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
      { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
    ];
    return languages.find(lang => lang.code === langCode) || { flag: '🌐', name: 'Unknown' };
  };

  const sourceLangDisplay = getLanguageDisplay(sourceLanguage);
  const targetLangDisplay = getLanguageDisplay(targetLanguage);

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl text-gray-800">
          <Languages className="w-6 h-6 text-blue-600" />
          Bidirectional Translator
        </CardTitle>
        <p className="text-sm text-gray-600">Translate between Japanese and other languages</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Source Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">From:</span>
                <div className="flex items-center gap-2">
                  <span>{sourceLangDisplay.flag}</span>
                  <span className="text-sm font-medium">{sourceLangDisplay.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {sourceLanguage === 'ja' && (
                  <SpeechRecognition
                    onTranscriptionComplete={handleSpeechTranscription}
                    isRecording={isRecording}
                    onRecordingChange={setIsRecording}
                  />
                )}
                {sourceText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(sourceText)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="relative">
              <Textarea
                placeholder={sourceLanguage === 'ja' ? "ここに日本語のテキストを入力してください..." : "Enter text to translate to Japanese..."}
                value={sourceText}
                onChange={handleTextChange}
                className="min-h-[120px] text-lg border-2 border-gray-200 focus:border-blue-400 transition-colors"
                style={sourceLanguage === 'ja' ? { fontFamily: '"Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif' } : {}}
                disabled={isRecording}
                maxLength={MAX_TEXT_LENGTH}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {sourceText.length}/{MAX_TEXT_LENGTH}
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
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">To:</span>
                <div className="flex items-center gap-2">
                  <span>{targetLangDisplay.flag}</span>
                  <span className="text-sm font-medium">{targetLangDisplay.name}</span>
                </div>
              </div>
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
                <p className="text-lg text-gray-800 leading-relaxed"
                   style={targetLanguage === 'ja' ? { fontFamily: '"Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif' } : {}}>
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

        {/* Controls */}
        <div className="flex justify-center items-center gap-4">
          <LanguageSelector 
            selectedLanguage={sourceLanguage === 'ja' ? targetLanguage : sourceLanguage} 
            onLanguageChange={(lang) => {
              if (sourceLanguage === 'ja') {
                setTargetLanguage(lang);
              } else {
                setSourceLanguage(lang);
              }
            }}
            excludeJapanese={true}
          />
          
          <Button
            onClick={swapLanguages}
            variant="outline"
            size="sm"
            className="p-2 hover:bg-blue-50"
            disabled={isTranslating || isRecording}
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
          
          <TranslateButton 
            onClick={translateText} 
            isLoading={isTranslating}
            disabled={!sourceText.trim() || isRecording}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TranslationCard;

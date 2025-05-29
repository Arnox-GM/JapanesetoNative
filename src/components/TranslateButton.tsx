
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';

interface TranslateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const TranslateButton: React.FC<TranslateButtonProps> = ({ 
  onClick, 
  isLoading, 
  disabled 
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      size="lg"
      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Translating...
        </>
      ) : (
        <>
          Translate
          <ArrowRight className="w-5 h-5 ml-2" />
        </>
      )}
    </Button>
  );
};

export default TranslateButton;

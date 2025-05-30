
import React from 'react';
import TranslationCard from '../components/TranslationCard';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            日本語翻訳
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Translate Japanese text into English or any other language with ease
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <TranslationCard />
        </div>
        
        <div className="text-center mt-12 text-gray-500">
          <p className="flex items-center justify-center gap-2">
            <span className="text-2xl">🇯🇵</span>
            Made with care for Japanese language learners
            <span className="text-2xl">✨</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;


import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
        className="text-sm font-medium"
      >
        {language === 'en' ? 'FR' : 'EN'}
      </Button>
    </div>
  );
};

export default LanguageSelector;

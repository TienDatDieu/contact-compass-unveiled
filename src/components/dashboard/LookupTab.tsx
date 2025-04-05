
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import LookupForm from '../LookupForm';
import ResultCard, { ContactResult } from '../ResultCard';
import LoadingSpinner from '../LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { lookupEmail } from '../../services/lookupService';

interface LookupTabProps {
  onResultFound: (result: ContactResult) => void;
}

const LookupTab = ({ onResultFound }: LookupTabProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<ContactResult | null>(null);

  const handleSearch = async (email: string) => {
    setIsSearching(true);
    setResult(null);
    
    try {
      const contactData = await lookupEmail(email);
      
      if (contactData) {
        setResult(contactData);
        onResultFound(contactData);
      } else {
        toast({
          title: t('lookup.noResults'),
          description: t('lookup.tryDifferentEmail'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: t('lookup.error'),
        description: t('lookup.errorTryAgain'),
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('lookup.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <LookupForm onSubmit={handleSearch} isProcessing={isSearching} />
        </CardContent>
      </Card>
      
      {isSearching && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-lg">{t('lookup.searching')}</span>
        </div>
      )}
      
      {result && !isSearching && (
        <div className="mt-8">
          <ResultCard result={result} />
        </div>
      )}
    </div>
  );
};

export default LookupTab;

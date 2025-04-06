
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import LookupForm from '../LookupForm';
import ResultCard, { ContactResult } from '../ResultCard';
import LoadingSpinner from '../LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { lookupEmail } from '../../services/lookupService';
import { useAuth } from '../../contexts/AuthContext';

interface LookupTabProps {
  onResultFound: (result: ContactResult) => void;
}

const LookupTab = ({ onResultFound }: LookupTabProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, isGuest } = useAuth();
  
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<ContactResult | null>(null);

  const handleSearch = async (email: string) => {
    setIsSearching(true);
    setResult(null);
    
    try {
      const contactData = await lookupEmail(email, isGuest);
      
      if (contactData) {
        setResult(contactData);
        // Only store in history for authenticated users
        if (user && !isGuest) {
          onResultFound(contactData);
        }
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
      {isGuest && !user && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-4">
          <p className="text-amber-800 text-sm">
            You're using Contact Compass as a guest. Your lookup history won't be saved.
            <br />
            <a href="/login" className="text-blue-600 hover:underline">Sign in</a> or <a href="/register" className="text-blue-600 hover:underline">create an account</a> for full access.
          </p>
        </div>
      )}
      
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

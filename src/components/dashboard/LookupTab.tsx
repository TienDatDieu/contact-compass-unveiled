
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import LookupForm from '../LookupForm';
import ResultCard from '../ResultCard';
import LoadingSpinner from '../LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { lookupEmail, ContactResult } from '../../services/lookupService';
import { useAuth } from '../../contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SearchX } from 'lucide-react';

interface LookupTabProps {
  onResultFound: (result: ContactResult) => void;
}

const LookupTab = ({ onResultFound }: LookupTabProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, isGuest } = useAuth();
  
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<ContactResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async (email: string) => {
    setIsSearching(true);
    setResult(null);
    setSearchError(null);
    
    try {
      const contactData = await lookupEmail(email);
      
      if (contactData) {
        setResult(contactData);
        // Only store in history for authenticated users
        if (user && !isGuest) {
          onResultFound(contactData);
        }
        
        // Show toast with source info
        const confidenceScore = contactData.confidence_score || 0;
        if (confidenceScore >= 75) {
          toast({
            title: 'Search completed',
            description: 'Found high confidence results for this email',
            variant: 'default',
          });
        } else if (confidenceScore >= 50) {
          toast({
            title: 'Search completed',
            description: 'Found results with medium confidence - some information may be approximate',
            variant: 'default',
          });
        } else {
          toast({
            title: 'Limited results found',
            description: 'Could only find basic information for this email',
            variant: 'default',
          });
        }
      } else {
        setSearchError('No results found for this email address.');
        toast({
          title: t('lookup.noResults'),
          description: t('lookup.tryDifferentEmail'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('An error occurred while searching. Please try again.');
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
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="mt-4 text-lg">{t('lookup.searching')}</span>
          <p className="text-sm text-muted-foreground mt-2">
            Searching databases and public information...
          </p>
        </div>
      )}
      
      {searchError && !isSearching && (
        <Alert variant="destructive">
          <SearchX className="h-4 w-4" />
          <AlertTitle>Search failed</AlertTitle>
          <AlertDescription>{searchError}</AlertDescription>
        </Alert>
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


import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LookupForm from '../components/LookupForm';
import ResultCard, { ContactResult } from '../components/ResultCard';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';

interface HistoryItem extends ContactResult {
  timestamp: string;
}

const Dashboard = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<ContactResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // Check if there's an email in the URL params
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    
    if (emailParam) {
      handleSearch(emailParam);
    }
  }, [location.search]);
  
  const handleSearch = (email: string) => {
    setSearchQuery(email);
    setIsSearching(true);
    setResult(null);
    
    // Here we'll connect with Supabase and external API in future
    // Simulating lookup for now
    setTimeout(() => {
      // Generate mock data for demonstration
      const mockData: ContactResult = {
        email,
        name: {
          first: email.split('@')[0].split('.')[0],
          last: email.split('@')[0].split('.')[1] || 'Smith'
        },
        company: {
          name: email.split('@')[1].split('.')[0].charAt(0).toUpperCase() + email.split('@')[1].split('.')[0].slice(1),
          website: email.split('@')[1],
          position: 'Product Manager'
        },
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        social: {
          linkedin: 'https://linkedin.com/in/' + email.split('@')[0],
          twitter: 'https://twitter.com/' + email.split('@')[0]
        },
        confidence_score: Math.floor(Math.random() * 30) + 70 // 70-99
      };
      
      setResult(mockData);
      
      // Add to history
      const historyItem: HistoryItem = {
        ...mockData,
        timestamp: new Date().toISOString()
      };
      
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]);
      setIsSearching(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">{t('dashboard.welcome')}</h1>
      
      <Tabs defaultValue="lookup" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="lookup">{t('lookup.title')}</TabsTrigger>
          <TabsTrigger value="history">{t('dashboard.recentSearches')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lookup" className="space-y-6">
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
        </TabsContent>
        
        <TabsContent value="history">
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item, index) => (
                <div key={index} className="bg-card rounded-lg p-4 border shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="font-medium">{item.name.first} {item.name.last}</span>
                      <span className="ml-3 text-sm text-muted-foreground">{item.email}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    {item.company?.name && (
                      <span className="text-muted-foreground">{item.company.name}</span>
                    )}
                    {item.location && (
                      <span className="text-muted-foreground">{item.location}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  {t('dashboard.noSearches')}
                </p>
                <TabsTrigger value="lookup" className="cursor-pointer">
                  {t('dashboard.searchNew')}
                </TabsTrigger>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

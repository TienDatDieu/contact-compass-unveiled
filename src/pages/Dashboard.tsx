import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LookupForm from '../components/LookupForm';
import ResultCard, { ContactResult } from '../components/ResultCard';
import UserSearchResults, { UserSearchResult } from '../components/UserSearchResults';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import { lookupEmail } from '../services/lookupService';
import { searchUsersByProject } from '@/lib/supabase';

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

  // Project search state
  const [projectQuery, setProjectQuery] = useState<string>('Cuong Ho Project');
  const [isProjectSearching, setIsProjectSearching] = useState(false);
  const [projectResults, setProjectResults] = useState<UserSearchResult[]>([]);

  useEffect(() => {
    // Check if there's an email in the URL params
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    
    if (emailParam) {
      handleSearch(emailParam);
    }

    // Search for "Cuong Ho Project" by default when the page loads
    handleProjectSearch();
  }, [location.search]);
  
  const handleSearch = async (email: string) => {
    setSearchQuery(email);
    setIsSearching(true);
    setResult(null);
    
    try {
      // Use our lookup service to search for the email
      const contactData = await lookupEmail(email);
      
      if (contactData) {
        setResult(contactData);
        
        // Add to history
        const historyItem: HistoryItem = {
          ...contactData,
          timestamp: new Date().toISOString()
        };
        
        setHistory(prev => [historyItem, ...prev.slice(0, 9)]);
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

  const handleProjectSearch = async () => {
    setIsProjectSearching(true);
    try {
      const users = await searchUsersByProject(projectQuery);
      setProjectResults(users || []);
    } catch (error) {
      console.error('Project search error:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search for project users',
        variant: 'destructive',
      });
    } finally {
      setIsProjectSearching(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">{t('dashboard.welcome')}</h1>
      
      <Tabs defaultValue="lookup" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="lookup">{t('lookup.title')}</TabsTrigger>
          <TabsTrigger value="project-search">Project Search</TabsTrigger>
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

        <TabsContent value="project-search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project User Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Project name"
                    value={projectQuery}
                    onChange={(e) => setProjectQuery(e.target.value)}
                    className="h-12"
                    disabled={isProjectSearching}
                  />
                </div>
                <Button 
                  onClick={handleProjectSearch}
                  className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
                  disabled={isProjectSearching}
                >
                  {isProjectSearching ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <span className="mr-2">🔍</span>
                  )}
                  Search Users
                </Button>
              </div>
            </CardContent>
          </Card>

          <UserSearchResults 
            results={projectResults}
            isLoading={isProjectSearching} 
          />
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

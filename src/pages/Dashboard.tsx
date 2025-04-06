import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactResult } from '../components/ResultCard';
import LookupTab from '../components/dashboard/LookupTab';
import ProjectSearchTab from '../components/dashboard/ProjectSearchTab';
import HistoryTab from '../components/dashboard/HistoryTab';
import { useLanguage } from '../contexts/LanguageContext';
import TodoList from '../components/TodoList';

interface HistoryItem extends ContactResult {
  timestamp: string;
}

const Dashboard = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    
    if (emailParam) {
      setSearchQuery(emailParam);
    }
  }, [location.search]);

  const handleResultFound = (result: ContactResult) => {
    const historyItem: HistoryItem = {
      ...result,
      timestamp: new Date().toISOString()
    };
    
    setHistory(prev => [historyItem, ...prev.slice(0, 9)]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <TodoList />
      
      <Tabs defaultValue="lookup" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="lookup">{t('lookup.title')}</TabsTrigger>
          <TabsTrigger value="project-search">Project Search</TabsTrigger>
          <TabsTrigger value="history">{t('dashboard.recentSearches')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lookup">
          <LookupTab 
            onResultFound={handleResultFound} 
          />
        </TabsContent>

        <TabsContent value="project-search">
          <ProjectSearchTab />
        </TabsContent>
        
        <TabsContent value="history">
          <HistoryTab history={history} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

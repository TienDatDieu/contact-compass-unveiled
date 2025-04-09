
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TabsTrigger } from '@/components/ui/tabs';
import { ContactResult } from '../../services/lookupService';
import { useLanguage } from '../../contexts/LanguageContext';

interface HistoryItem extends ContactResult {
  timestamp: string;
}

interface HistoryTabProps {
  history: HistoryItem[];
}

const HistoryTab = ({ history }: HistoryTabProps) => {
  const { t } = useLanguage();

  if (history.length === 0) {
    return (
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
    );
  }

  return (
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
  );
};

export default HistoryTab;

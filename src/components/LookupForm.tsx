
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '../contexts/LanguageContext';
import LoadingSpinner from './LoadingSpinner';

interface LookupFormProps {
  onSubmit: (email: string) => void;
  isProcessing?: boolean;
}

const LookupForm = ({ onSubmit, isProcessing = false }: LookupFormProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple email validation
    if (!email.trim() || !email.includes('@')) {
      toast({
        title: t('lookup.invalidEmail'),
        description: t('lookup.enterValidEmail'),
        variant: 'destructive',
      });
      return;
    }
    
    onSubmit(email);
  };
  
  const handleBulkUpload = () => {
    toast({
      title: t('lookup.comingSoon'),
      description: t('lookup.bulkUploadFeature'),
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
              disabled={isProcessing}
            />
          </div>
          <Button 
            type="submit" 
            className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Search className="h-5 w-5 mr-2" />
            )}
            {t('lookup.search')}
          </Button>
        </div>
      </form>
      
      <div className="mt-4 text-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBulkUpload}
          className="text-sm text-muted-foreground"
        >
          <Upload className="h-3 w-3 mr-1" />
          {t('lookup.bulkUpload')}
        </Button>
      </div>
    </div>
  );
};

export default LookupForm;

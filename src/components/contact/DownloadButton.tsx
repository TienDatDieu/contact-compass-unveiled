
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { ContactResult } from '../../services/lookupService';

interface DownloadButtonProps {
  result: ContactResult;
}

const DownloadButton = ({ result }: DownloadButtonProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleDownload = () => {
    const fileContent = JSON.stringify(result, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.email}-contact-info.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: t('results.downloadSuccess'),
      description: t('results.fileReady'),
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDownload}>
      <Download className="h-4 w-4 mr-2" />
      {t('results.download')}
    </Button>
  );
};

export default DownloadButton;

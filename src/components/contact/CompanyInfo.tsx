
import React from 'react';
import { Briefcase, Globe, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface CompanyInfoProps {
  companyName?: string;
  companyWebsite?: string;
}

const CompanyInfo = ({ companyName, companyWebsite }: CompanyInfoProps) => {
  const { t } = useLanguage();
  
  if (!companyName && !companyWebsite) {
    return null;
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('results.companyInfo')}</h3>
      <ul className="space-y-3">
        {companyName && (
          <li className="flex items-center">
            <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{companyName}</span>
          </li>
        )}
        {companyWebsite && (
          <li className="flex items-center">
            <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
            <a href={`https://${companyWebsite}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
              {companyWebsite}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </li>
        )}
      </ul>
    </div>
  );
};

export default CompanyInfo;

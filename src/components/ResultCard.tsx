
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Mail, Phone, Globe, Briefcase, MapPin, LinkedIn, Twitter, Github } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '../contexts/LanguageContext';

export interface ContactResult {
  email: string;
  name: {
    first: string;
    last: string;
  };
  company?: {
    name: string;
    website?: string;
    position?: string;
  };
  phone?: string;
  location?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  avatar?: string;
  confidence_score?: number;
}

interface ResultCardProps {
  result: ContactResult;
}

const ResultCard = ({ result }: ResultCardProps) => {
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

  const confidenceColor = result.confidence_score && result.confidence_score > 75 
    ? 'bg-green-100 text-green-800' 
    : result.confidence_score && result.confidence_score > 50 
    ? 'bg-yellow-100 text-yellow-800' 
    : 'bg-red-100 text-red-800';

  const fullName = `${result.name.first} ${result.name.last}`;
  const initials = `${result.name.first.charAt(0)}${result.name.last.charAt(0)}`;

  // Debug the social links
  console.log("Social links in ResultCard:", result.social);

  return (
    <Card className="w-full overflow-hidden border-gray-200">
      <CardHeader className="bg-gray-50 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
              <AvatarImage src={result.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{fullName}</CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                {result.company?.position && (
                  <span className="flex items-center">
                    <Briefcase className="h-3.5 w-3.5 mr-1" />
                    {result.company.position}
                  </span>
                )}
              </div>
            </div>
          </div>
          {result.confidence_score && (
            <Badge className={`${confidenceColor} font-normal`}>
              {t('results.confidence')}: {result.confidence_score}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('results.contactInfo')}</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{result.email}</span>
                </li>
                {result.phone && (
                  <li className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{result.phone}</span>
                  </li>
                )}
                {result.location && (
                  <li className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{result.location}</span>
                  </li>
                )}
              </ul>
            </div>

            {(result.company?.name || result.company?.website) && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('results.companyInfo')}</h3>
                <ul className="space-y-3">
                  {result.company?.name && (
                    <li className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{result.company.name}</span>
                    </li>
                  )}
                  {result.company?.website && (
                    <li className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`https://${result.company.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                        {result.company.website}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('results.socialProfiles')}</h3>
              <ul className="space-y-3">
                {result.social?.linkedin && (
                  <li>
                    <a href={result.social.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
                      <LinkedIn className="h-4 w-4 mr-2" />
                      LinkedIn
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                )}
                {result.social?.twitter && (
                  <li>
                    <a href={result.social.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                )}
                {result.social?.github && (
                  <li>
                    <a href={result.social.github} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <Separator className="my-4" />
        
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            {t('results.download')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultCard;

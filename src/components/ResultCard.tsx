
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ProfileHeader from './contact/ProfileHeader';
import ContactInfo from './contact/ContactInfo';
import CompanyInfo from './contact/CompanyInfo';
import SocialProfiles from './social/SocialProfiles';
import DownloadButton from './contact/DownloadButton';
import { ContactResult } from '../services/lookupService';

interface ResultCardProps {
  result: ContactResult;
}

const ResultCard = ({ result }: ResultCardProps) => {
  console.log("Full result object:", JSON.stringify(result, null, 2));
  console.log("Social links in ResultCard:", result.social);
  
  return (
    <Card className="w-full overflow-hidden border-gray-200">
      <CardHeader className="bg-gray-50 pb-0">
        <ProfileHeader 
          firstName={result.name.first}
          lastName={result.name.last}
          position={result.company?.position}
          avatar={result.avatar}
          confidenceScore={result.confidence_score}
        />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ContactInfo 
              email={result.email}
              phone={result.phone}
              location={result.location}
            />

            {(result.company?.name || result.company?.website) && (
              <CompanyInfo 
                companyName={result.company.name}
                companyWebsite={result.company.website}
              />
            )}
          </div>

          <div className="space-y-4">
            <SocialProfiles 
              github={result.social?.github}
              linkedin={result.social?.linkedin}
              twitter={result.social?.twitter}
            />
          </div>
        </div>

        <Separator className="my-4" />
        
        <div className="flex justify-end">
          <DownloadButton result={result} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultCard;

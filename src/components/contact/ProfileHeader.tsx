
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  position?: string;
  avatar?: string;
  confidenceScore?: number;
}

const ProfileHeader = ({ firstName, lastName, position, avatar, confidenceScore }: ProfileHeaderProps) => {
  const { t } = useLanguage();
  const fullName = `${firstName} ${lastName}`;
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

  const confidenceColor = confidenceScore && confidenceScore > 75 
    ? 'bg-green-100 text-green-800' 
    : confidenceScore && confidenceScore > 50 
    ? 'bg-yellow-100 text-yellow-800' 
    : 'bg-red-100 text-red-800';

  return (
    <div className="flex justify-between items-start">
      <div className="flex items-center space-x-4">
        <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
          <AvatarImage src={avatar} />
          <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">{fullName}</h2>
          <div className="text-sm text-muted-foreground mt-1">
            {position && (
              <span className="flex items-center">
                <Briefcase className="h-3.5 w-3.5 mr-1" />
                {position}
              </span>
            )}
          </div>
        </div>
      </div>
      {confidenceScore && (
        <Badge className={`${confidenceColor} font-normal`}>
          {t('results.confidence')}: {confidenceScore}%
        </Badge>
      )}
    </div>
  );
};

export default ProfileHeader;

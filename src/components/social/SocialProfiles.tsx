
import React from 'react';
import { Github, Twitter, ExternalLink } from 'lucide-react';
import { Linkedin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SocialProfilesProps {
  github?: string;
  linkedin?: string;
  twitter?: string;
}

const SocialProfiles = ({ github, linkedin, twitter }: SocialProfilesProps) => {
  const { t } = useLanguage();
  const hasSocial = github || linkedin || twitter;

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('results.socialProfiles')}</h3>
      <ul className="space-y-3">
        {github && (
          <li>
            <a href={github} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
              <Github className="h-4 w-4 mr-2" />
              GitHub
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </li>
        )}
        {linkedin && (
          <li>
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </li>
        )}
        {twitter && (
          <li>
            <a href={twitter} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </li>
        )}
        {!hasSocial && (
          <li className="text-gray-500 italic">No social profiles found</li>
        )}
      </ul>
    </div>
  );
};

export default SocialProfiles;

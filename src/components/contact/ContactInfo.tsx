
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ContactInfoProps {
  email: string;
  phone?: string;
  location?: string;
}

const ContactInfo = ({ email, phone, location }: ContactInfoProps) => {
  const { t } = useLanguage();

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('results.contactInfo')}</h3>
      <ul className="space-y-3">
        <li className="flex items-center">
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{email}</span>
        </li>
        {phone && (
          <li className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{phone}</span>
          </li>
        )}
        {location && (
          <li className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{location}</span>
          </li>
        )}
      </ul>
    </div>
  );
};

export default ContactInfo;

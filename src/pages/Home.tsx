
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LookupForm from '../components/LookupForm';
import { useLanguage } from '../contexts/LanguageContext';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const handleSearch = (email: string) => {
    navigate(`/dashboard?email=${email}`);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Simple Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container px-4 md:px-6 mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white mb-6">
            {t('home.hero.title')}
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl mb-8">
            {t('home.hero.subtitle')}
          </p>
          
          {/* Main Search Box */}
          <div className="w-full mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {t('lookup.title')}
            </h2>
            <LookupForm onSubmit={handleSearch} />
          </div>
        </div>
      </section>

      {/* Simple Features Section */}
      <section className="w-full py-12 bg-gray-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight">
              {t('home.features.title')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">{t('home.features.emailLookup.title')}</h3>
              <p className="text-sm text-gray-600 mt-2">
                {t('home.features.emailLookup.description')}
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">{t('home.features.enrichment.title')}</h3>
              <p className="text-sm text-gray-600 mt-2">
                {t('home.features.enrichment.description')}
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">{t('home.features.bulk.title')}</h3>
              <p className="text-sm text-gray-600 mt-2">
                {t('home.features.bulk.description')}
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">{t('home.features.api.title')}</h3>
              <p className="text-sm text-gray-600 mt-2">
                {t('home.features.api.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA Section */}
      <section className="w-full py-12 bg-white">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="mx-auto max-w-[600px] text-gray-600 mb-6">
            {t('home.cta.subtitle')}
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            {t('home.cta.button')}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;

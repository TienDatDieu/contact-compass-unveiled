
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, Users, Database, Code, CheckCircle } from 'lucide-react';
import LookupForm from '../components/LookupForm';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const handleSearch = (email: string) => {
    navigate(`/dashboard?email=${email}`);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 hero-gradient">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-white">
                {t('home.hero.title')}
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                {t('home.hero.subtitle')}
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <LookupForm onSubmit={handleSearch} />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <Link to="/register">
                <Button size="lg" className="font-medium">
                  {t('home.hero.cta')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="#features">
                <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                  {t('home.hero.secondaryCta')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                {t('home.features.title')}
              </h2>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 md:gap-8 mt-8">
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 bg-card">
              <div className="p-2 bg-primary/10 rounded-full">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">{t('home.features.emailLookup.title')}</h3>
              <p className="text-muted-foreground text-center">
                {t('home.features.emailLookup.description')}
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 bg-card">
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">{t('home.features.enrichment.title')}</h3>
              <p className="text-muted-foreground text-center">
                {t('home.features.enrichment.description')}
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 bg-card">
              <div className="p-2 bg-primary/10 rounded-full">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">{t('home.features.bulk.title')}</h3>
              <p className="text-muted-foreground text-center">
                {t('home.features.bulk.description')}
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 bg-card">
              <div className="p-2 bg-primary/10 rounded-full">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">{t('home.features.api.title')}</h3>
              <p className="text-muted-foreground text-center">
                {t('home.features.api.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                {t('home.cta.title')}
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                {t('home.cta.subtitle')}
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link to="/register">
                <Button size="lg">
                  {t('home.cta.button')}
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              {t('home.cta.noCC')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Here we'll connect with Supabase in future
      // Simulating login for now
      setTimeout(() => {
        // Simulate success for demonstration
        toast({
          title: t('login.success'),
          description: `Welcome back ${email.split('@')[0]}!`,
        });
        
        // Navigate to dashboard
        navigate('/dashboard');
        
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      toast({
        title: t('login.error'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t('login.title')}</CardTitle>
          <CardDescription>Enter your email and password to sign in</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('login.password')}</Label>
                <Link to="#" className="text-xs text-primary hover:underline">
                  {t('login.forgot')}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              {t('login.button')}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              {t('login.noAccount')}{' '}
              <Link to="/register" className="text-primary hover:underline">
                {t('login.register')}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;

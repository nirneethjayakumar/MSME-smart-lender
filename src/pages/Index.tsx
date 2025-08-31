import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, TrendingUp, FileCheck, Users, ArrowRight, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user, loading } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: Building,
      titleKey: 'landing.features.ledger.title',
      descriptionKey: 'landing.features.ledger.description'
    },
    {
      icon: TrendingUp,
      titleKey: 'landing.features.reports.title',
      descriptionKey: 'landing.features.reports.description'
    },
    {
      icon: FileCheck,
      titleKey: 'landing.features.credit.title',
      descriptionKey: 'landing.features.credit.description'
    },
    {
      icon: Users,
      titleKey: 'landing.features.lender.title',
      descriptionKey: 'landing.features.lender.description'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header with Language Toggle */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-2">
            <Languages className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">EN</span>
            <Switch
              checked={language === 'hi'}
              onCheckedChange={toggleLanguage}
              className="data-[state=checked]:bg-primary"
            />
            <span className="text-sm text-muted-foreground">हि</span>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mb-8">
            <Building className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('landing.hero.appName')}
            </span>
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-muted-foreground mb-6">
            {t('landing.hero.subtitle')}
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
            {t('landing.hero.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-medium bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
                {t('landing.hero.cta')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50 hover:scale-105">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-muted-foreground to-foreground rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg mb-2">
                  {t(feature.titleKey)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(feature.descriptionKey)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {t('landing.cta.title')}
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('landing.cta.description')}
          </p>
          <Link to="/auth">
            <Button size="lg" className="h-14 px-8 text-lg font-medium bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
              {t('landing.cta.button')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
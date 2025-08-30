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
      title: "व्यापार की खाता बही",
      subtitle: "Business Ledger Analysis", 
      description: "अपनी हस्तलिखित खाता बही को डिजिटल में बदलें और वित्तीय विश्लेषण प्राप्त करें"
    },
    {
      icon: TrendingUp,
      title: "वित्तीय रिपोर्ट",
      subtitle: "Financial Reports",
      description: "राजस्व, व्यय और लाभ का विस्तृत विश्लेषण और ट्रेंड देखें"
    },
    {
      icon: FileCheck,
      title: "क्रेडिट स्कोर",
      subtitle: "Credit Scoring",
      description: "आपके व्यापार का क्रेडिट स्कोर और लेंडर पैकेज तैयार करें"
    },
    {
      icon: Users,
      title: "लेंडर कनेक्शन",
      subtitle: "Lender Connections",
      description: "बैंकों और वित्तीय संस्थानों के लिए तैयार डॉक्यूमेंट एक्सपोर्ट करें"
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
              व्यापारी क्रेडिट जीनी
            </span>
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-muted-foreground mb-6">
            MSME Credit Solutions
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            अपनी हस्तलिखित खाता बही, बिल और चालान को डिजिटल में बदलें।
            <br />
            AI की मदद से वित्तीय विश्लेषण प्राप्त करें और क्रेडिट के लिए तैयार हों।
          </p>
          
          <p className="text-base md:text-lg text-muted-foreground/80 mb-12">
            Transform your handwritten ledgers, bills and invoices into digital format.
            <br />
            Get AI-powered financial analysis and become credit-ready.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-medium bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
                शुरू करें / Get Started
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
                  {feature.title}
                </CardTitle>
                <CardDescription className="font-medium text-primary">
                  {feature.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            आज ही शुरू करें / Start Today
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            मिनटों में साइन अप करें और अपने व्यापार की वित्तीय यात्रा शुरू करें।
            <br />
            Sign up in minutes and begin your business financial journey.
          </p>
          <Link to="/auth">
            <Button size="lg" className="h-14 px-8 text-lg font-medium bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
              मुफ्त में शुरू करें / Start Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
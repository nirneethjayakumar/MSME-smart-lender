import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Building, 
  LogOut, 
  Upload, 
  FileText, 
  BarChart3, 
  Download,
  Home,
  Languages
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { signOut } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { name: t('nav.dashboard'), path: '/dashboard', icon: Home },
    { name: t('nav.upload'), path: '/upload', icon: Upload },
    { name: t('nav.documents'), path: '/documents', icon: FileText },
    { name: t('nav.statement'), path: '/statement', icon: BarChart3 },
    { name: t('nav.export'), path: '/export', icon: Download },
  ];

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-primary">
              {t('nav.appName')}
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-2 ${
                      isActive 
                        ? "bg-gradient-to-r from-primary to-accent text-white" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden lg:block">{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Language Toggle */}
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

          {/* Logout Button */}
          <Button 
            onClick={signOut}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">{t('nav.logout')}</span>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-1 whitespace-nowrap ${
                      isActive 
                        ? "bg-gradient-to-r from-primary to-accent text-white" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-xs">{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
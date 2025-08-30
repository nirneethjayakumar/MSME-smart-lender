import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navbar
    'nav.dashboard': 'Dashboard',
    'nav.upload': 'Upload',
    'nav.documents': 'Documents',
    'nav.statement': 'Statement',
    'nav.export': 'Export',
    'nav.logout': 'Logout',
    'nav.appName': 'Vyapari Credit Genie',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.totalDocuments': 'Total Documents',
    'dashboard.extractedLines': 'Extracted Lines',
    'dashboard.totalValue': 'Total Value',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.uploadDoc': 'Upload Document',
    'dashboard.viewDocs': 'View Documents',
    'dashboard.generateReport': 'Generate Report',
    'dashboard.recentActivity': 'Recent Activity',
    
    // Upload
    'upload.title': 'Upload Documents',
    'upload.dragDrop': 'Drag and drop your files here, or click to browse',
    'upload.supportedFormats': 'Supported formats: JPG, PNG, PDF',
    'upload.analyze': 'Analyze Documents',
    
    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.enterOtp': 'Enter OTP',
    'auth.sendOtp': 'Send OTP',
    'auth.verifyOtp': 'Verify OTP',
    
    // Landing
    'landing.hero.title': 'Smart Credit Analysis for Indian SMBs',
    'landing.hero.subtitle': 'Upload your business documents and get instant credit analysis powered by AI',
    'landing.hero.cta': 'Get Started Free',
    'landing.features.title': 'Features',
    'landing.features.ai': 'AI-Powered Analysis',
    'landing.features.multilingual': 'Multilingual Support',
    'landing.features.instant': 'Instant Reports'
  },
  hi: {
    // Navbar
    'nav.dashboard': 'डैशबोर्ड',
    'nav.upload': 'अपलोड',
    'nav.documents': 'दस्तावेज़',
    'nav.statement': 'रिपोर्ट',
    'nav.export': 'निर्यात',
    'nav.logout': 'लॉग आउट',
    'nav.appName': 'व्यापारी क्रेडिट जीनी',
    
    // Dashboard
    'dashboard.title': 'डैशबोर्ड',
    'dashboard.totalDocuments': 'कुल दस्तावेज़',
    'dashboard.extractedLines': 'निकाली गई लाइनें',
    'dashboard.totalValue': 'कुल मूल्य',
    'dashboard.quickActions': 'त्वरित कार्य',
    'dashboard.uploadDoc': 'दस्तावेज़ अपलोड करें',
    'dashboard.viewDocs': 'दस्तावेज़ देखें',
    'dashboard.generateReport': 'रिपोर्ट बनाएं',
    'dashboard.recentActivity': 'हाल की गतिविधि',
    
    // Upload
    'upload.title': 'दस्तावेज़ अपलोड करें',
    'upload.dragDrop': 'अपनी फ़ाइलें यहाँ खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें',
    'upload.supportedFormats': 'समर्थित प्रारूप: JPG, PNG, PDF',
    'upload.analyze': 'दस्तावेज़ का विश्लेषण करें',
    
    // Auth
    'auth.signIn': 'साइन इन',
    'auth.signUp': 'साइन अप',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.enterOtp': 'OTP दर्ज करें',
    'auth.sendOtp': 'OTP भेजें',
    'auth.verifyOtp': 'OTP सत्यापित करें',
    
    // Landing
    'landing.hero.title': 'भारतीय SMB के लिए स्मार्ट क्रेडिट विश्लेषण',
    'landing.hero.subtitle': 'अपने व्यावसायिक दस्तावेज़ अपलोड करें और AI द्वारा संचालित तत्काल क्रेडिट विश्लेषण प्राप्त करें',
    'landing.hero.cta': 'मुफ्त में शुरू करें',
    'landing.features.title': 'सुविधाएं',
    'landing.features.ai': 'AI-संचालित विश्लेषण',
    'landing.features.multilingual': 'बहुभाषी समर्थन',
    'landing.features.instant': 'तत्काल रिपोर्ट'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('hi');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
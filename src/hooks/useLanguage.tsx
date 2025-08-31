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
    'landing.hero.appName': 'Vyapari Credit Genie',
    'landing.hero.subtitle': 'MSME Credit Solutions',
    'landing.hero.description': 'Transform your handwritten ledgers, bills and invoices into digital format. Get AI-powered financial analysis and become credit-ready.',
    'landing.hero.cta': 'Get Started',
    'landing.features.ledger.title': 'Business Ledger Analysis',
    'landing.features.ledger.description': 'Transform your handwritten ledgers into digital format and get financial analysis',
    'landing.features.reports.title': 'Financial Reports',
    'landing.features.reports.description': 'View detailed analysis and trends of revenue, expenses and profit',
    'landing.features.credit.title': 'Credit Scoring',
    'landing.features.credit.description': 'Prepare your business credit score and lender package',
    'landing.features.lender.title': 'Lender Connections',
    'landing.features.lender.description': 'Export ready documents for banks and financial institutions',
    'landing.cta.title': 'Start Today',
    'landing.cta.description': 'Sign up in minutes and begin your business financial journey.',
    'landing.cta.button': 'Start Free'
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
    'landing.hero.appName': 'व्यापारी क्रेडिट जीनी',
    'landing.hero.subtitle': 'MSME क्रेडिट समाधान',
    'landing.hero.description': 'अपनी हस्तलिखित खाता बही, बिल और चालान को डिजिटल में बदलें। AI की मदद से वित्तीय विश्लेषण प्राप्त करें और क्रेडिट के लिए तैयार हों।',
    'landing.hero.cta': 'शुरू करें',
    'landing.features.ledger.title': 'व्यापार की खाता बही',
    'landing.features.ledger.description': 'अपनी हस्तलिखित खाता बही को डिजिटल में बदलें और वित्तीय विश्लेषण प्राप्त करें',
    'landing.features.reports.title': 'वित्तीय रिपोर्ट',
    'landing.features.reports.description': 'राजस्व, व्यय और लाभ का विस्तृत विश्लेषण और ट्रेंड देखें',
    'landing.features.credit.title': 'क्रेडिट स्कोर',
    'landing.features.credit.description': 'आपके व्यापार का क्रेडिट स्कोर और लेंडर पैकेज तैयार करें',
    'landing.features.lender.title': 'लेंडर कनेक्शन',
    'landing.features.lender.description': 'बैंकों और वित्तीय संस्थानों के लिए तैयार डॉक्यूमेंट एक्सपोर्ट करें',
    'landing.cta.title': 'आज ही शुरू करें',
    'landing.cta.description': 'मिनटों में साइन अप करें और अपने व्यापार की वित्तीय यात्रा शुरू करें।',
    'landing.cta.button': 'मुफ्त में शुरू करें'
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
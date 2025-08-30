import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Upload, 
  FileText, 
  TrendingUp, 
  IndianRupee,
  Users,
  FileCheck,
  Download,
  Building
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Mock KPI data - would come from API
  const kpis = [
    {
      title: "कुल राजस्व / Total Revenue",
      value: "₹12,50,000",
      change: "+15.2%",
      icon: IndianRupee,
      color: "text-success"
    },
    {
      title: "मासिक व्यय / Monthly Expenses", 
      value: "₹8,75,000",
      change: "-3.1%",
      icon: TrendingUp,
      color: "text-warning"
    },
    {
      title: "लाभ मार्जिन / Profit Margin",
      value: "18.5%",
      change: "+2.3%",
      icon: BarChart3,
      color: "text-success"
    },
    {
      title: "क्रेडिट स्कोर / Credit Score",
      value: "742",
      change: "+12 pts",
      icon: FileCheck,
      color: "text-primary"
    }
  ];

  const quickActions = [
    {
      title: "दस्तावेज़ अपलोड करें",
      subtitle: "Upload Documents",
      description: "बिल, चालान और खाता बही अपलोड करें",
      icon: Upload,
      link: "/upload",
      color: "bg-gradient-to-r from-primary to-accent"
    },
    {
      title: "दस्तावेज़ देखें",
      subtitle: "View Documents", 
      description: "अपलोड किए गए दस्तावेज़ों की स्थिति देखें",
      icon: FileText,
      link: "/documents",
      color: "bg-gradient-to-r from-secondary to-success"
    },
    {
      title: "वित्तीय रिपोर्ट",
      subtitle: "Financial Statement",
      description: "विस्तृत वित्तीय विश्लेषण देखें",
      icon: BarChart3,
      link: "/statement",
      color: "bg-gradient-to-r from-accent to-warning"
    },
    {
      title: "लेंडर पैकेज",
      subtitle: "Export Package",
      description: "ऋणदाताओं के लिए रिपोर्ट निर्यात करें",
      icon: Download,
      link: "/export",
      color: "bg-gradient-to-r from-muted-foreground to-foreground"
    }
  ];

  const recentActivity = [
    { action: "Invoice uploaded", time: "2 घंटे पहले", status: "processing" },
    { action: "Ledger analyzed", time: "5 घंटे पहले", status: "completed" },
    { action: "Statement generated", time: "1 दिन पहले", status: "completed" },
    { action: "PDF exported", time: "2 दिन पहले", status: "completed" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            नमस्ते / Welcome, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground text-lg">
            आपके व्यापार के वित्तीय डैशबोर्ड में आपका स्वागत है / Welcome to your business financial dashboard
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <Card key={index} className="bg-gradient-to-br from-card to-card/50 border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                <p className={`text-xs ${kpi.color} flex items-center`}>
                  {kpi.change}
                  <span className="text-muted-foreground ml-1">पिछले महीने से</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link}>
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-card to-card/50 hover:scale-105">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">
                    {action.title}
                  </CardTitle>
                  <CardDescription className="font-medium text-muted-foreground">
                    {action.subtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              हाल की गतिविधि / Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="font-medium">{activity.action}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={activity.status === 'completed' ? 'default' : 'secondary'}
                      className={activity.status === 'completed' ? 'bg-success' : 'bg-warning'}
                    >
                      {activity.status === 'completed' ? 'पूर्ण' : 'प्रगति में'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
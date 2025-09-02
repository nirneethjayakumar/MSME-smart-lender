import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
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
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    profitMargin: 0,
    creditScore: 0,
    documentCount: 0,
    extractedLines: 0
  });
  const [kpiLoading, setKpiLoading] = useState(true);

  useEffect(() => {
    const fetchKpiData = async () => {
      if (!user?.id) return;

      try {
        // Fetch documents count
        const { data: documents, error: docsError } = await supabase
          .from('documents')
          .select('id')
          .eq('user_id', user.id);

        if (docsError) throw docsError;

        // Fetch extracted lines with financial data
        const { data: lines, error: linesError } = await supabase
          .from('extracted_lines')
          .select('debit, credit')
          .in('document_id', documents?.map(doc => doc.id) || []);

        if (linesError) throw linesError;

        // Calculate totals
        const totalCredit = lines?.reduce((sum, line) => sum + (Number(line.credit) || 0), 0) || 0;
        const totalDebit = lines?.reduce((sum, line) => sum + (Number(line.debit) || 0), 0) || 0;
        const profit = totalCredit - totalDebit;
        const profitMargin = totalCredit > 0 ? (profit / totalCredit) * 100 : 0;

        // Fetch latest statement for credit score
        const { data: statements } = await supabase
          .from('statements')
          .select('score')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        setKpiData({
          totalRevenue: totalCredit,
          totalExpenses: totalDebit,
          profitMargin: profitMargin,
          creditScore: statements?.[0]?.score || 0,
          documentCount: documents?.length || 0,
          extractedLines: lines?.length || 0
        });
      } catch (error) {
        console.error('Error fetching KPI data:', error);
      } finally {
        setKpiLoading(false);
      }
    };

    fetchKpiData();
  }, [user?.id]);

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

  const kpis = [
    {
      title: t('dashboard.totalRevenue'),
      value: kpiLoading ? "..." : `₹${kpiData.totalRevenue.toLocaleString('en-IN')}`,
      change: "+15.2%",
      icon: IndianRupee,
      color: "text-success"
    },
    {
      title: t('dashboard.monthlyExpenses'),
      value: kpiLoading ? "..." : `₹${kpiData.totalExpenses.toLocaleString('en-IN')}`,
      change: "-3.1%",
      icon: TrendingUp,
      color: "text-warning"
    },
    {
      title: t('dashboard.profitMargin'),
      value: kpiLoading ? "..." : `${kpiData.profitMargin.toFixed(1)}%`,
      change: "+2.3%",
      icon: BarChart3,
      color: "text-success"
    },
    {
      title: t('dashboard.creditScore'),
      value: kpiLoading ? "..." : kpiData.creditScore.toString(),
      change: "+12 pts",
      icon: FileCheck,
      color: "text-primary"
    }
  ];

  const quickActions = [
    {
      title: t('dashboard.uploadDocuments'),
      description: t('dashboard.uploadDescription'),
      icon: Upload,
      link: "/upload",
      color: "bg-gradient-to-r from-primary to-accent"
    },
    {
      title: t('dashboard.viewDocuments'),
      description: t('dashboard.viewDescription'),
      icon: FileText,
      link: "/documents",
      color: "bg-gradient-to-r from-secondary to-success"
    },
    {
      title: t('dashboard.financialStatement'),
      description: t('dashboard.statementDescription'),
      icon: BarChart3,
      link: "/statement",
      color: "bg-gradient-to-r from-accent to-warning"
    },
    {
      title: t('dashboard.lenderPackage'),
      description: t('dashboard.packageDescription'),
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
            {t('dashboard.welcome')}, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('dashboard.subtitle')}
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
                  <span className="text-muted-foreground ml-1">{t('dashboard.fromLastMonth')}</span>
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
              {t('dashboard.recentActivity')}
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
                      {activity.status === 'completed' ? t('dashboard.completed') : t('dashboard.processing')}
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
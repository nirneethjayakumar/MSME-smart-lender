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
    extractedLines: 0,
    revenueChange: 0,
    expenseChange: 0,
    profitMarginChange: 0,
    creditScoreChange: 0
  });
  const [kpiLoading, setKpiLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<Array<{
    action: string;
    time: string;
    status: 'processing' | 'completed' | 'failed';
    type: string;
  }>>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const fetchKpiData = async () => {
      if (!user?.id) return;

      try {
        // Fetch documents count
        const { data: documents, error: docsError } = await supabase
          .from('documents')
          .select('id, created_at')
          .eq('user_id', user.id);

        if (docsError) throw docsError;

        // Fetch extracted lines with financial data
        const { data: lines, error: linesError } = await supabase
          .from('extracted_lines')
          .select('debit, credit, date')
          .in('document_id', documents?.map(doc => doc.id) || []);

        if (linesError) throw linesError;

        // Calculate current month data
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const currentMonthLines = lines?.filter(line => {
          if (!line.date) return false;
          const lineDate = new Date(line.date);
          return lineDate.getMonth() === currentMonth && lineDate.getFullYear() === currentYear;
        }) || [];

        // Calculate previous month data
        const previousDate = new Date(currentYear, currentMonth - 1, 1);
        const previousMonth = previousDate.getMonth();
        const previousYear = previousDate.getFullYear();
        
        const previousMonthLines = lines?.filter(line => {
          if (!line.date) return false;
          const lineDate = new Date(line.date);
          return lineDate.getMonth() === previousMonth && lineDate.getFullYear() === previousYear;
        }) || [];

        // Calculate current totals
        const totalCredit = currentMonthLines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
        const totalDebit = currentMonthLines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
        const profit = totalCredit - totalDebit;
        const profitMargin = totalCredit > 0 ? (profit / totalCredit) * 100 : 0;

        // Calculate previous totals
        const prevTotalCredit = previousMonthLines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
        const prevTotalDebit = previousMonthLines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
        const prevProfit = prevTotalCredit - prevTotalDebit;
        const prevProfitMargin = prevTotalCredit > 0 ? (prevProfit / prevTotalCredit) * 100 : 0;

        // Calculate percentage changes
        const revenueChange = prevTotalCredit > 0 ? ((totalCredit - prevTotalCredit) / prevTotalCredit) * 100 : 0;
        const expenseChange = prevTotalDebit > 0 ? ((totalDebit - prevTotalDebit) / prevTotalDebit) * 100 : 0;
        const profitMarginChange = prevProfitMargin > 0 ? profitMargin - prevProfitMargin : 0;

        // Fetch latest two statements for credit score comparison
        const { data: statements } = await supabase
          .from('statements')
          .select('score')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(2);

        const currentScore = statements?.[0]?.score || 0;
        const previousScore = statements?.[1]?.score || 0;
        const creditScoreChange = currentScore - previousScore;

        setKpiData({
          totalRevenue: totalCredit,
          totalExpenses: totalDebit,
          profitMargin: profitMargin,
          creditScore: currentScore,
          documentCount: documents?.length || 0,
          extractedLines: lines?.length || 0,
          revenueChange,
          expenseChange,
          profitMarginChange,
          creditScoreChange
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
      change: kpiLoading ? "..." : `${kpiData.revenueChange >= 0 ? '+' : ''}${kpiData.revenueChange.toFixed(1)}%`,
      icon: IndianRupee,
      color: kpiData.revenueChange >= 0 ? "text-success" : "text-destructive"
    },
    {
      title: t('dashboard.monthlyExpenses'),
      value: kpiLoading ? "..." : `₹${kpiData.totalExpenses.toLocaleString('en-IN')}`,
      change: kpiLoading ? "..." : `${kpiData.expenseChange >= 0 ? '+' : ''}${kpiData.expenseChange.toFixed(1)}%`,
      icon: TrendingUp,
      color: kpiData.expenseChange <= 0 ? "text-success" : "text-destructive"
    },
    {
      title: t('dashboard.profitMargin'),
      value: kpiLoading ? "..." : `${kpiData.profitMargin.toFixed(1)}%`,
      change: kpiLoading ? "..." : `${kpiData.profitMarginChange >= 0 ? '+' : ''}${kpiData.profitMarginChange.toFixed(1)}%`,
      icon: BarChart3,
      color: kpiData.profitMarginChange >= 0 ? "text-success" : "text-destructive"
    },
    {
      title: t('dashboard.creditScore'),
      value: kpiLoading ? "..." : kpiData.creditScore.toString(),
      change: kpiLoading ? "..." : `${kpiData.creditScoreChange >= 0 ? '+' : ''}${kpiData.creditScoreChange} pts`,
      icon: FileCheck,
      color: kpiData.creditScoreChange >= 0 ? "text-success" : "text-destructive"
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

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!user?.id) return;

      try {
        const { data: documents, error } = await supabase
          .from('documents')
          .select('type, status, created_at, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(4);

        if (error) throw error;

        const activities = documents?.map(doc => {
          const timeAgo = new Date().getTime() - new Date(doc.updated_at).getTime();
          const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
          const daysAgo = Math.floor(timeAgo / (1000 * 60 * 60 * 24));
          
          let timeDisplay;
          if (daysAgo > 0) {
            timeDisplay = `${daysAgo} ${t('dashboard.daysAgo')}`;
          } else if (hoursAgo > 0) {
            timeDisplay = `${hoursAgo} ${t('dashboard.hoursAgo')}`;
          } else {
            timeDisplay = t('dashboard.justNow');
          }

          let actionText = t('dashboard.documentUploaded');
          if (doc.type === 'invoice') {
            actionText = t('dashboard.invoiceUploaded');
          } else if (doc.type === 'ledger') {
            actionText = t('dashboard.ledgerUploaded');
          }

          return {
            action: actionText,
            time: timeDisplay,
            status: doc.status as 'processing' | 'completed' | 'failed',
            type: doc.type
          };
        }) || [];

        setRecentActivity(activities);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchRecentActivity();
  }, [user?.id, t]);

  const getActivityStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('dashboard.completed');
      case 'processing':
        return t('dashboard.processing');
      case 'pending':
        return t('dashboard.pending');
      case 'failed':
        return t('dashboard.failed');
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success';
      case 'processing':
      case 'pending':
        return 'bg-warning';
      case 'failed':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

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
              {activityLoading ? (
                <div className="animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-muted"></div>
                        <div className="h-4 w-32 bg-muted rounded"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-16 bg-muted rounded"></div>
                        <div className="h-4 w-20 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="font-medium">{activity.action}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={activity.status === 'completed' ? 'default' : 'secondary'}
                        className={getStatusColor(activity.status)}
                      >
                        {getActivityStatusText(activity.status)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t('dashboard.noRecentActivity')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
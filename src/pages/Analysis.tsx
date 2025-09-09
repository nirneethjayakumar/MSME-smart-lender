import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  BarChart3,
  PieChart
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Document {
  id: string;
  type: string;
  status: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface ExtractedLine {
  id: string;
  date: string | null;
  particulars: string | null;
  counterparty: string | null;
  debit: number | null;
  credit: number | null;
  currency: string | null;
}

interface AnalysisSummary {
  totalTransactions: number;
  totalCredits: number;
  totalDebits: number;
  netCashFlow: number;
  transactionsByMonth: { [key: string]: number };
  topCounterparties: { name: string; amount: number; type: 'credit' | 'debit' }[];
}

const DocumentSelection = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [extractedLines, setExtractedLines] = useState<ExtractedLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  useEffect(() => {
    console.log('Analysis page - User state:', { user: user?.id, loading });
    if (user?.id) {
      fetchDocuments();
      fetchExtractedLines();
    }
  }, [user?.id]);

  const fetchDocuments = async () => {
    if (!user?.id) {
      console.log('No user ID, skipping document fetch');
      return;
    }

    console.log('Fetching documents for user:', user.id);

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Documents fetched:', data?.length || 0);
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchExtractedLines = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('extracted_lines')
        .select(`
          *,
          documents!inner(id, user_id, type)
        `)
        .eq('documents.user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      console.log('Extracted lines fetched:', data?.length || 0);
      setExtractedLines(data || []);
    } catch (error) {
      console.error('Error fetching extracted lines:', error);
    }
  };

  const triggerAnalysis = async (documentId: string) => {
    if (!user?.id) {
      console.log('No user ID found');
      return;
    }
    
    console.log('Starting analysis for document:', documentId);
    console.log('User ID:', user.id);
    
    setAnalyzing(documentId);
    try {
      console.log('Calling analyze-document function...');
      
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: { document_id: documentId }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }
      
      toast.success('Analysis started! This may take a few moments.');
      
      // Refresh data after a delay to see the results
      setTimeout(() => {
        fetchDocuments();
        fetchExtractedLines();
      }, 3000);
      
    } catch (error) {
      console.error('Error triggering analysis:', error);
      toast.error(`Failed to start analysis: ${error.message || 'Unknown error'}`);
      setAnalyzing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Financial Analysis
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-powered insights from your uploaded documents
          </p>
        </div>

        {/* Show analysis summary if we have extracted data */}
        {extractedLines.length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
                <CardDescription>
                  Overview of all analyzed transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{extractedLines.filter(l => l.credit).reduce((sum, l) => sum + (l.credit || 0), 0).toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Credits</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      ₹{extractedLines.filter(l => l.debit).reduce((sum, l) => sum + (l.debit || 0), 0).toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Debits</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{(extractedLines.filter(l => l.credit).reduce((sum, l) => sum + (l.credit || 0), 0) - 
                         extractedLines.filter(l => l.debit).reduce((sum, l) => sum + (l.debit || 0), 0)).toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {extractedLines.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                  </div>
                </div>

                {/* Recent transactions table */}
                <div>
                  <h4 className="font-medium mb-3">Recent Transactions</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 font-medium">Date</th>
                          <th className="text-left p-3 font-medium">Particulars</th>
                          <th className="text-left p-3 font-medium">Counterparty</th>
                          <th className="text-right p-3 font-medium">Credit</th>
                          <th className="text-right p-3 font-medium">Debit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extractedLines.slice(0, 10).map((line, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3 text-sm">
                              {line.date ? new Date(line.date).toLocaleDateString() : '-'}
                            </td>
                            <td className="p-3 text-sm">{line.particulars}</td>
                            <td className="p-3 text-sm">{line.counterparty || '-'}</td>
                            <td className="p-3 text-sm text-right text-green-600">
                              {line.credit ? `₹${line.credit.toLocaleString()}` : '-'}
                            </td>
                            <td className="p-3 text-sm text-right text-red-600">
                              {line.debit ? `₹${line.debit.toLocaleString()}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
        </div>

        {documents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No analyzed documents</h3>
              <p className="text-muted-foreground mb-4">
                Upload and analyze documents to view financial insights here.
              </p>
              <Link to="/upload">
                <Button>Upload Document</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize text-sm">
                      {doc.type.replace('_', ' ')}
                    </CardTitle>
                    <Badge variant={doc.status === 'completed' ? 'default' : doc.status === 'processing' ? 'secondary' : 'outline'}>
                      {doc.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {doc.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
                      {doc.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {doc.status === 'completed' ? 'Analyzed' : doc.status === 'processing' ? 'Processing' : doc.status === 'failed' ? 'Failed' : 'Ready to Analyze'}
                    </Badge>
                  </div>
                  <CardDescription>
                    Uploaded {new Date(doc.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <img 
                    src={doc.image_url} 
                    alt="Document preview"
                    className="w-full h-32 object-cover rounded-lg bg-muted"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="mt-4 text-center">
                    {doc.status === 'completed' ? (
                      <Link to={`/analysis?document=${doc.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Analysis
                        </Button>
                      </Link>
                    ) : doc.status === 'processing' ? (
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        <Clock className="h-4 w-4 mr-2" />
                        Processing...
                      </Button>
                    ) : (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full" 
                        onClick={() => triggerAnalysis(doc.id)}
                        disabled={analyzing === doc.id}
                      >
                        {analyzing === doc.id ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Starting Analysis...
                          </>
                        ) : (
                          <>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Generate Analysis
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Analysis = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const documentId = searchParams.get('document');
  
  const [document, setDocument] = useState<Document | null>(null);
  const [extractedLines, setExtractedLines] = useState<ExtractedLine[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const fetchDocumentAnalysis = async () => {
    if (!user?.id || !documentId) return;

    try {
      setLoadingData(true);
      
      // Fetch document details
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', user.id)
        .single();

      if (docError) throw docError;
      setDocument(doc);

      // Fetch extracted lines
      const { data: lines, error: linesError } = await supabase
        .from('extracted_lines')
        .select('*')
        .eq('document_id', documentId)
        .order('date', { ascending: false });

      if (linesError) throw linesError;
      setExtractedLines(lines || []);

      // Calculate analysis
      if (lines && lines.length > 0) {
        const totalCredits = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
        const totalDebits = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
        
        // Group by month
        const transactionsByMonth: { [key: string]: number } = {};
        lines.forEach(line => {
          if (line.date) {
            const month = new Date(line.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            transactionsByMonth[month] = (transactionsByMonth[month] || 0) + 1;
          }
        });

        // Top counterparties
        const counterpartyMap: { [key: string]: { credit: number; debit: number } } = {};
        lines.forEach(line => {
          if (line.counterparty) {
            if (!counterpartyMap[line.counterparty]) {
              counterpartyMap[line.counterparty] = { credit: 0, debit: 0 };
            }
            counterpartyMap[line.counterparty].credit += line.credit || 0;
            counterpartyMap[line.counterparty].debit += line.debit || 0;
          }
        });

        const topCounterparties = Object.entries(counterpartyMap)
          .map(([name, amounts]) => ({
            name,
            amount: Math.max(amounts.credit, amounts.debit),
            type: amounts.credit > amounts.debit ? 'credit' as const : 'debit' as const
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);

        setAnalysis({
          totalTransactions: lines.length,
          totalCredits,
          totalDebits,
          netCashFlow: totalCredits - totalDebits,
          transactionsByMonth,
          topCounterparties
        });
      }
    } catch (error) {
      console.error('Error fetching document analysis:', error);
      toast.error('Failed to fetch document analysis');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchDocumentAnalysis();
  }, [user?.id, documentId]);

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

  // If no document ID, show document selection interface
  if (!documentId) {
    return <DocumentSelection />;
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/documents">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Documents
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Document Analysis
              </h1>
              <p className="text-muted-foreground text-lg">
                AI-powered financial insights from your document
              </p>
            </div>
          </div>
        </div>

        {loadingData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !document ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Document not found</h3>
              <p className="text-muted-foreground mb-4">
                The requested document could not be found or you don't have access to it.
              </p>
              <Link to="/documents">
                <Button>View All Documents</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Document Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="capitalize">
                        {document.type.replace('_', ' ')} Analysis
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Uploaded {new Date(document.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(document.status)}
                    <Badge variant="secondary">
                      {document.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <img 
                  src={document.image_url} 
                  alt="Document"
                  className="w-full max-w-md h-48 object-cover rounded-lg bg-muted mx-auto"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </CardContent>
            </Card>

            {document.status === 'completed' && analysis ? (
              <>
                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analysis.totalTransactions}</div>
                      <p className="text-xs text-muted-foreground">
                        Extracted entries
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        Total Credits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-success">
                        {formatCurrency(analysis.totalCredits)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Incoming amounts
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-destructive" />
                        Total Debits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-destructive">
                        {formatCurrency(analysis.totalDebits)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Outgoing amounts
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${analysis.netCashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(analysis.netCashFlow)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Credits - Debits
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Counterparties */}
                {analysis.topCounterparties.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        Top Counterparties
                      </CardTitle>
                      <CardDescription>
                        Most frequent transaction partners
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysis.topCounterparties.map((counterparty, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-medium">{counterparty.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${counterparty.type === 'credit' ? 'text-success' : 'text-destructive'}`}>
                                {formatCurrency(counterparty.amount)}
                              </span>
                              {counterparty.type === 'credit' ? (
                                <TrendingUp className="h-4 w-4 text-success" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Transaction Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Transaction Details
                    </CardTitle>
                    <CardDescription>
                      All extracted transactions from this document
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {extractedLines.map((line) => (
                        <div key={line.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                          <div className="flex-1">
                            <div className="font-medium text-foreground">
                              {line.particulars || 'No description'}
                            </div>
                            {line.counterparty && (
                              <div className="text-sm text-muted-foreground">
                                {line.counterparty}
                              </div>
                            )}
                            {line.date && (
                              <div className="text-xs text-muted-foreground">
                                {new Date(line.date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            {line.credit && (
                              <div className="text-success font-semibold">
                                +{formatCurrency(line.credit)}
                              </div>
                            )}
                            {line.debit && (
                              <div className="text-destructive font-semibold">
                                -{formatCurrency(line.debit)}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {line.currency || 'INR'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : document.status === 'processing' ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Clock className="mx-auto h-12 w-12 text-warning mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analysis in Progress</h3>
                  <p className="text-muted-foreground mb-4">
                    Gemini is currently analyzing your document. This may take a few moments.
                  </p>
                  <Button onClick={fetchDocumentAnalysis} variant="outline">
                    Refresh Status
                  </Button>
                </CardContent>
              </Card>
            ) : document.status === 'failed' ? (
              <Card className="text-center py-12">
                <CardContent>
                  <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analysis Failed</h3>
                  <p className="text-muted-foreground mb-4">
                    There was an error analyzing this document. Please try uploading again.
                  </p>
                  <Link to="/upload">
                    <Button>Upload New Document</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analysis Pending</h3>
                  <p className="text-muted-foreground mb-4">
                    This document is waiting to be analyzed.
                  </p>
                  <Button onClick={fetchDocumentAnalysis} variant="outline">
                    Check Status
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;
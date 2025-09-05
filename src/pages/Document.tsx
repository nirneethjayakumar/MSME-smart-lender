import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Eye, 
  Download,
  Calendar,
  User,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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

const Documents = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [extractedLines, setExtractedLines] = useState<{[key: string]: ExtractedLine[]}>({});
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!user?.id) return;

    try {
      setLoadingDocs(true);
      const { data: docs, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(docs || []);

      // Fetch extracted lines for each document
      if (docs && docs.length > 0) {
        const linesPromises = docs.map(async (doc) => {
          const { data: lines } = await supabase
            .from('extracted_lines')
            .select('*')
            .eq('document_id', doc.id)
            .order('date', { ascending: false });
          
          return { docId: doc.id, lines: lines || [] };
        });

        const results = await Promise.all(linesPromises);
        const linesMap: {[key: string]: ExtractedLine[]} = {};
        results.forEach(({ docId, lines }) => {
          linesMap[docId] = lines;
        });
        setExtractedLines(linesMap);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setLoadingDocs(false);
    }
  };

  const retryAnalysis = async (documentId: string) => {
    try {
      toast.loading('Retrying document analysis...');
      
      const { error } = await supabase.functions.invoke('analyze-document', {
        body: { document_id: documentId }
      });

      if (error) throw error;
      toast.success('Analysis started successfully');
      fetchDocuments(); // Refresh documents
    } catch (error) {
      console.error('Error retrying analysis:', error);
      toast.error('Failed to retry analysis');
    }
  };

  useEffect(() => {
    fetchDocuments();
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Document Library
          </h1>
          <p className="text-muted-foreground text-lg">
            View and manage your uploaded documents and extracted data
          </p>
        </div>

        {loadingDocs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents uploaded yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first document to get started with financial analysis
              </p>
              <Button onClick={() => window.location.href = '/upload'}>
                Upload Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <Card key={doc.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">
                      {doc.type.replace('_', ' ')}
                    </CardTitle>
                    <Badge 
                      variant="secondary"
                      className={getStatusColor(doc.status)}
                    >
                      {getStatusText(doc.status)}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(doc.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Document Preview */}
                    <div className="relative">
                      <img 
                        src={doc.image_url} 
                        alt="Document preview"
                        className="w-full h-32 object-cover rounded-lg bg-muted"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>

                    {/* Extracted Data Summary */}
                    {extractedLines[doc.id] && extractedLines[doc.id].length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Extracted Data:</h4>
                        <div className="text-xs text-muted-foreground">
                          {extractedLines[doc.id].length} transactions found
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-success">Credits: </span>
                            {formatCurrency(
                              extractedLines[doc.id].reduce((sum, line) => sum + (line.credit || 0), 0)
                            )}
                          </div>
                          <div>
                            <span className="text-destructive">Debits: </span>
                            {formatCurrency(
                              extractedLines[doc.id].reduce((sum, line) => sum + (line.debit || 0), 0)
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedDocument(selectedDocument === doc.id ? null : doc.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {selectedDocument === doc.id ? 'Hide' : 'View'} Details
                      </Button>
                      
                      {doc.status === 'failed' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => retryAnalysis(doc.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Detailed View */}
                    {selectedDocument === doc.id && extractedLines[doc.id] && (
                      <div className="mt-4 border-t pt-4">
                        <h5 className="font-semibold text-sm mb-2">Transaction Details:</h5>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                          {extractedLines[doc.id].map((line) => (
                            <div key={line.id} className="text-xs border rounded p-2 bg-muted/50">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium">{line.particulars || 'No description'}</div>
                                  {line.counterparty && (
                                    <div className="text-muted-foreground">{line.counterparty}</div>
                                  )}
                                  {line.date && (
                                    <div className="text-muted-foreground">{new Date(line.date).toLocaleDateString()}</div>
                                  )}
                                </div>
                                <div className="text-right">
                                  {line.credit && (
                                    <div className="text-success">+{formatCurrency(line.credit)}</div>
                                  )}
                                  {line.debit && (
                                    <div className="text-destructive">-{formatCurrency(line.debit)}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {doc.status === 'failed' && (
                      <div className="flex items-center gap-2 text-destructive text-xs">
                        <AlertCircle className="h-4 w-4" />
                        Analysis failed. Click retry to try again.
                      </div>
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

export default Documents;
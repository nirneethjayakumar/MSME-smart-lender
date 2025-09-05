import * as React from 'react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload as UploadIcon, FileText, Image, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const Upload = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return; // safeguard against null

    // Convert FileList to File[] directly
    const files: File[] = Array.from(e.target.files);
    //const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const imageFiles = files.filter(file => file.type.startsWith('image/') && file.size <= MAX_IMAGE_SIZE);
    
    if (imageFiles.length !== files.length) {
      toast({
        title: "केवल इमेज फ़ाइलें / Only Image Files",
        description: "कृपया केवल इमेज फ़ाइलें अपलोड करें / Please upload only image files",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !documentType) {
      toast({
        title: "अधूरी जानकारी / Incomplete Information",
        description: "कृपया फ़ाइलें और दस्तावेज़ प्रकार चुनें / Please select files and document type",
        variant: "destructive",
      });
      return;
    }
    if (!user) {
      console.error("No logged-in user found");
      toast({
        title: "Authentication Required",
        description: "कृपया पहले लॉग इन करें / Please login first",
        variant: "destructive",
      });
      return;
    }
  
    setIsUploading(true);
  
    try {
      const uploadedDocuments = [];
      console.log("Uploading for user.id:", user.id);
  
      for (const file of selectedFiles) {
        // 1. Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop();
        //const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('document-images') // CHANGE to your bucket name
          .upload(fileName, file);
  
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
  
        // 2. Get the public URL
        const { data: urlData} = supabase.storage
          .from('document-images')
          .getPublicUrl(fileName);
          if (!urlData || !urlData.publicUrl) {
            // Handle: public URL not generated (possible misconfiguration or file not found)
            throw new Error('Could not get public URL for uploaded file.');
          }
        const publicUrl = urlData.publicUrl;
        console.log("Public URL for uploaded file:", publicUrl);
  
        // 3. Insert document row in DB (array syntax!)
        const { data: document, error: docError } = await supabase
          .from('documents')
          .insert([{
            type: documentType,
            image_url: publicUrl,
            user_id: user.id,
            status: 'pending'
          }])
          .select()
          .single();
  
        if (docError){
          console.error('Supabase DB insert error:', docError);
           throw new Error(`Database error: ${docError.message}`);
        }
        uploadedDocuments.push(document);
  
        // 4. Trigger post-upload processing (optional)
        const { error: analysisError } = await supabase.functions.invoke('analyze-document', {
          body: { document_id: document.id }
        });
  
        if (analysisError) {
          console.error('Analysis error:', analysisError);
        }
      }
  
      toast({
        title: "सफल अपलोड / Upload Successful",
        description: `${selectedFiles.length} फ़ाइलें सफलतापूर्वक अपलोड हुईं और विश्लेषण शुरू हो गया / ${selectedFiles.length} files uploaded successfully and analysis started`,
      });
  
      setSelectedFiles([]);
      setDocumentType('');
  
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "अपलोड त्रुटि / Upload Error",
        description: error instanceof Error ? error.message : "फ़ाइल अपलोड करने में समस्या / Problem uploading files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  

  const documentTypes = [
    { value: 'bank_statement', label: 'बैंक स्टेटमेंट / Bank Statement' },
    { value: 'invoice', label: 'चालान / Invoice' },
    { value: 'receipt', label: 'रसीद / Receipt' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mb-4">
                <UploadIcon className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                दस्तावेज़ अपलोड करें / Upload Documents
              </CardTitle>
              <CardDescription>
                अपनी हस्तलिखित खाता बही, बिल और चालान की तस्वीरें अपलोड करें
                <br />
                Upload images of your handwritten ledgers, bills, and invoices
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Document Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="document-type" className="text-base font-medium">
                  दस्तावेज़ प्रकार / Document Type *
                </Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="दस्तावेज़ प्रकार चुनें / Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload Area */}
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  फ़ाइलें चुनें / Select Files *
                </Label>
                
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-foreground mb-2">
                      फ़ाइलें यहाँ चुनें / Click to select files
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, JPEG तक (अधिकतम 5MB प्रति फ़ाइल)
                      <br />
                      PNG, JPG, JPEG up to 5MB per file
                    </p>
                  </label>
                </div>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    चुनी गई फ़ाइलें / Selected Files ({selectedFiles.length})
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <Button 
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || !documentType || isUploading}
                className="w-full h-12 text-lg font-medium bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    अपलोड हो रहा है... / Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-5 h-5 mr-2" />
                    अपलोड करें / Upload ({selectedFiles.length} फ़ाइलें)
                  </>
                )}
              </Button>
              
              {/* Help Text */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2">
                  बेहतर परिणामों के लिए / For Better Results:
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• स्पष्ट और तेज़ तस्वीरें लें / Take clear and sharp images</li>
                  <li>• अच्छी रोशनी में फ़ोटो खींचें / Take photos in good lighting</li>
                  <li>• पूरा दस्तावेज़ फ्रेम में आना चाहिए / Entire document should be in frame</li>
                  <li>• हस्तलेखन स्पष्ट रूप से दिखना चाहिए / Handwriting should be clearly visible</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Upload;
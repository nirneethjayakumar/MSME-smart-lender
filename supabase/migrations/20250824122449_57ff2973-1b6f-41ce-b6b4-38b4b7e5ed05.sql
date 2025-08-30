-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  business_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ledger', 'bill', 'invoice')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create extracted_lines table
CREATE TABLE public.extracted_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  date DATE,
  counterparty TEXT,
  particulars TEXT,
  debit DECIMAL(15,2),
  credit DECIMAL(15,2),
  currency TEXT DEFAULT 'INR',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create statements table
CREATE TABLE public.statements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  revenue DECIMAL(15,2) DEFAULT 0,
  expenses DECIMAL(15,2) DEFAULT 0,
  profit DECIMAL(15,2) DEFAULT 0,
  cash_flow DECIMAL(15,2) DEFAULT 0,
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lender_packages table
CREATE TABLE public.lender_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  statement_id UUID NOT NULL REFERENCES public.statements(id) ON DELETE CASCADE,
  pdf_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lender_packages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for documents
CREATE POLICY "Users can view their own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for extracted_lines
CREATE POLICY "Users can view extracted lines from their documents" ON public.extracted_lines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE documents.id = extracted_lines.document_id 
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert extracted lines for their documents" ON public.extracted_lines
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE documents.id = extracted_lines.document_id 
      AND documents.user_id = auth.uid()
    )
  );

-- Create RLS policies for statements
CREATE POLICY "Users can view their own statements" ON public.statements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own statements" ON public.statements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statements" ON public.statements
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for lender_packages
CREATE POLICY "Users can view lender packages for their statements" ON public.lender_packages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.statements 
      WHERE statements.id = lender_packages.statement_id 
      AND statements.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create lender packages for their statements" ON public.lender_packages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.statements 
      WHERE statements.id = lender_packages.statement_id 
      AND statements.user_id = auth.uid()
    )
  );

-- Create storage bucket for document images
INSERT INTO storage.buckets (id, name, public) VALUES ('document-images', 'document-images', false);

-- Create storage policies for document images
CREATE POLICY "Users can view their own document images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'document-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload their own document images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'document-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_statements_updated_at
  BEFORE UPDATE ON public.statements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
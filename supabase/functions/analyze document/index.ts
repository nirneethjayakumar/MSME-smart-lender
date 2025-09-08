import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractedTransaction {
  date: string;
  particulars: string;
  counterparty: string;
  debit: number | null;
  credit: number | null;
  currency: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { document_id } = await req.json();
    
    if (!document_id) {
      return new Response(JSON.stringify({ error: 'Document ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

    // Get the authorization header and set it
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      supabase.auth.getSession = async () => ({
        data: { session: { access_token: authHeader.replace('Bearer ', '') } },
        error: null,
      });
    }

    console.log('Fetching document:', document_id);

    // Get document details
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', document_id)
      .maybeSingle();

    if (docError) {
      console.error('Error fetching document:', docError);
      return new Response(JSON.stringify({ error: 'Failed to fetch document' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!document) {
      return new Response(JSON.stringify({ error: 'Document not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Document found:', document.type, document.image_url);

    // Update document status to processing
    await supabase
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', document_id);

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('Gemini API key not found in environment variables');
      
      // Update document status to failed
      await supabase
        .from('documents')
        .update({ status: 'failed', error_message: 'API key not configured' })
        .eq('id', document_id);
        
      return new Response(JSON.stringify({ 
        error: 'Document analysis service is not properly configured. Please contact support.' 
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare the prompt based on document type
    const getPrompt = (docType: string) => {
      const basePrompt = `Analyze this financial document and extract transaction data. Return ONLY a JSON array of transactions with this exact structure:
[
  {
    "date": "YYYY-MM-DD",
    "particulars": "transaction description",
    "counterparty": "party name or bank/institution",
    "debit": amount or null,
    "credit": amount or null,
    "currency": "INR"
  }
]

Important rules:
- Use only numbers for debit/credit (no currency symbols)
- Date must be YYYY-MM-DD format
- For debit transactions, put amount in "debit" field and null in "credit"
- For credit transactions, put amount in "credit" field and null in "debit"
- Extract counterparty from transaction details (bank name, merchant, etc.)
- Return empty array [] if no transactions found
- Return ONLY the JSON array, no other text`;

      switch (docType) {
        case 'bank_statement':
          return `${basePrompt}

This is a bank statement. Look for:
- Transaction dates
- Description/particulars of each transaction
- Debit and credit amounts
- Counterparty information (merchant names, transfer recipients, etc.)`;
        
        case 'invoice':
          return `${basePrompt}

This is an invoice. Extract:
- Invoice date
- Invoice number in particulars
- Client/customer name as counterparty
- Total amount as credit (incoming payment)`;
        
        case 'receipt':
          return `${basePrompt}

This is a receipt. Extract:
- Date of purchase
- Vendor/store name as counterparty
- Item description in particulars
- Total amount as debit (outgoing payment)`;
        
        default:
          return basePrompt;
      }
    };

    console.log('Calling Gemini Vision API...');

    // Call Gemini Vision API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: getPrompt(document.type)
              },
              {
                inline_data: {
                  mime_type: "image/png",
                  data: await fetch(document.image_url)
                    .then(res => res.arrayBuffer())
                    .then(buffer => btoa(String.fromCharCode(...new Uint8Array(buffer))))
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 800,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      
      // Update document status to failed
      await supabase
        .from('documents')
        .update({ status: 'failed', error_message: `API error: ${response.status}` })
        .eq('id', document_id);
        
      return new Response(JSON.stringify({ 
        error: `Document analysis failed. Please try again later.` 
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = await response.json();
    console.log('Gemini response received');

    let extractedData: ExtractedTransaction[] = [];
    
    try {
      const content = aiResponse.candidates[0].content.parts[0].text.trim();
      console.log('AI Response content:', content);
      
      // Try to parse JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try to parse the entire content
        extractedData = JSON.parse(content);
      }
      
      console.log('Parsed extracted data:', extractedData);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw AI response:', aiResponse.candidates[0].content.parts[0].text);
      
      // Update document status to failed
      await supabase
        .from('documents')
        .update({ status: 'failed' })
        .eq('id', document_id);
        
      return new Response(JSON.stringify({ 
        error: 'Failed to parse extracted data',
        raw_response: aiResponse.candidates[0].content.parts[0].text 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert extracted lines into database
    if (extractedData.length > 0) {
      const extractedLines = extractedData.map(transaction => ({
        document_id,
        date: transaction.date || null,
        particulars: transaction.particulars,
        counterparty: transaction.counterparty,
        debit: transaction.debit,
        credit: transaction.credit,
        currency: transaction.currency || 'INR'
      }));

      console.log('Inserting extracted lines:', extractedLines.length);

      const { error: insertError } = await supabase
        .from('extracted_lines')
        .insert(extractedLines);

      if (insertError) {
        console.error('Error inserting extracted lines:', insertError);
        
        // Update document status to failed
        await supabase
          .from('documents')
          .update({ status: 'failed' })
          .eq('id', document_id);
          
        return new Response(JSON.stringify({ error: 'Failed to save extracted data' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Update document status to completed
    await supabase
      .from('documents')
      .update({ status: 'completed' })
      .eq('id', document_id);

    console.log('Document processing completed');

    return new Response(JSON.stringify({ 
      success: true,
      extracted_count: extractedData.length,
      document_id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-document function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
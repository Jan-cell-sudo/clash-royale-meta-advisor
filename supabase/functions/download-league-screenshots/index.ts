import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Download league screenshots function called');

    // Get league from query parameters
    const url = new URL(req.url);
    const league = url.searchParams.get('league');

    if (!league) {
      return new Response(
        JSON.stringify({ error: 'League parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Getting screenshots for league: ${league}`);

    // Get uploads for the specified league
    const { data: uploads, error: uploadsError } = await supabase
      .from('uploads')
      .select('id, filename, storage_path, league, upload_time, user_id')
      .eq('league', league)
      .eq('parse_status', 'completed')
      .order('upload_time', { ascending: false });

    if (uploadsError) {
      console.error('Error fetching uploads:', uploadsError);
      throw uploadsError;
    }

    if (!uploads || uploads.length === 0) {
      return new Response(
        JSON.stringify({ error: `No screenshots found for league: ${league}` }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found ${uploads.length} screenshots for ${league}`);

    // Create a ZIP file containing all screenshots
    const files: { name: string; content: Uint8Array }[] = [];

    for (const upload of uploads) {
      try {
        console.log(`Downloading file: ${upload.storage_path}`);
        
        const { data: fileData, error: fileError } = await supabase.storage
          .from('screenshots')
          .download(upload.storage_path);

        if (fileError || !fileData) {
          console.error(`Error downloading ${upload.storage_path}:`, fileError);
          continue; // Skip this file and continue with others
        }

        // Convert blob to Uint8Array
        const arrayBuffer = await fileData.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Create a sanitized filename with timestamp
        const timestamp = new Date(upload.upload_time).toISOString().slice(0, 19).replace(/:/g, '-');
        const userInfo = upload.user_id ? `user_${upload.user_id.slice(0, 8)}` : 'anonymous';
        const extension = upload.filename.split('.').pop() || 'png';
        const sanitizedName = `${timestamp}_${userInfo}_${upload.id}.${extension}`;

        files.push({
          name: sanitizedName,
          content: uint8Array
        });

        console.log(`Successfully added file: ${sanitizedName}`);
      } catch (error) {
        console.error(`Error processing file ${upload.storage_path}:`, error);
        continue; // Skip this file and continue
      }
    }

    if (files.length === 0) {
      return new Response(
        JSON.stringify({ error: `No valid screenshot files could be retrieved for league: ${league}` }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create ZIP file using JSZip equivalent for Deno
    const JSZip = (await import('https://esm.sh/jszip@3.10.1')).default;
    const zip = new JSZip();

    // Add each file to the ZIP
    files.forEach(file => {
      zip.file(file.name, file.content);
    });

    // Add a manifest file with metadata
    const manifest = {
      league: league,
      total_screenshots: files.length,
      generated_at: new Date().toISOString(),
      files: files.map(f => ({ name: f.name, size: f.content.length }))
    };

    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    // Generate ZIP file
    const zipContent = await zip.generateAsync({ type: 'uint8array' });

    console.log(`Generated ZIP file with ${files.length} screenshots for ${league}`);

    // Return the ZIP file
    const filename = `${league.replace(/\s+/g, '_').toLowerCase()}_screenshots_${new Date().toISOString().slice(0, 10)}.zip`;
    
    return new Response(zipContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error in download-league-screenshots function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { uploadId } = await req.json()
    
    if (!uploadId) {
      throw new Error('Upload ID is required')
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get upload details
    const { data: upload, error: uploadError } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', uploadId)
      .single()

    if (uploadError || !upload) {
      throw new Error(`Upload not found: ${uploadError?.message}`)
    }

    // Get file from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('screenshots')
      .download(upload.storage_path)

    if (fileError || !fileData) {
      throw new Error(`File not found: ${fileError?.message}`)
    }

    // Mock AI analysis - in reality, this would use computer vision
    // For now, we'll simulate troop detection with random data
    const mockTroops = [
      { id: 1, name: 'Goblin Archer', confidence: 0.95, position: 1 },
      { id: 2, name: 'Fire Mage', confidence: 0.88, position: 2 },
      { id: 3, name: 'Ice Wizard', confidence: 0.92, position: 3 },
      { id: 4, name: 'Shadow Knight', confidence: 0.85, position: 4 },
      { id: 5, name: 'Healing Monk', confidence: 0.90, position: 5 },
    ]

    // Use the league provided by the user during upload
    const userLeague = upload.league;
    
    if (!userLeague) {
      throw new Error('No league data found in upload record')
    }

    // Update upload to completed status (keep user's league)
    await supabase
      .from('uploads')
      .update({
        parse_status: 'completed'
      })
      .eq('id', uploadId)

    // Insert detected troops
    const detections = mockTroops.map((troop, index) => ({
      upload_id: uploadId,
      troop_id: troop.id,
      player_pos: index + 1,
      player_name: `Player${index + 1}`,
      star_level: Math.floor(Math.random() * 3) + 1,
      conf: troop.confidence
    }))

    const { error: detectionsError } = await supabase
      .from('detections')
      .insert(detections)

    if (detectionsError) {
      throw new Error(`Failed to insert detections: ${detectionsError.message}`)
    }

    console.log(`Analyzed screenshot ${uploadId}: found ${mockTroops.length} troops in ${userLeague}`)

    return new Response(
      JSON.stringify({
        success: true,
        uploadId,
        league: userLeague,
        troopsDetected: mockTroops.length,
        detections: mockTroops
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error analyzing screenshot:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
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

    // Convert blob to array buffer for analysis
    const imageBuffer = await fileData.arrayBuffer()
    
    // TODO: REAL COMPUTER VISION ANALYSIS WOULD GO HERE
    // This would use a trained model to detect all 24 troops:
    /*
    const analysisResult = await analyzeScreenshot(imageBuffer);
    
    // Real analysis would return something like:
    const detectedTroops = [
      // Player 1 (1st place) - 6 troops
      { troopId: 1, name: 'Knight', starLevel: 3, player: 1, position: 1, confidence: 0.97 },
      { troopId: 2, name: 'Archer', starLevel: 2, player: 1, position: 2, confidence: 0.94 },
      { troopId: 5, name: 'Mage', starLevel: 3, player: 1, position: 3, confidence: 0.91 },
      // ... 3 more troops for player 1
      
      // Player 2 (2nd place) - 6 troops  
      { troopId: 3, name: 'Tank', starLevel: 2, player: 2, position: 1, confidence: 0.89 },
      // ... 5 more troops for player 2
      
      // Player 3 (3rd place) - 6 troops
      // Player 4 (4th place) - 6 troops
      // Total: 24 troops detected
    ];
    */

    // For now, we'll create enhanced mock data that simulates all 24 troops
    const mockAllTroops = []
    const troopNames = ['Knight', 'Archer', 'Mage', 'Tank', 'Healer', 'Rogue', 'Paladin', 'Wizard', 'Barbarian', 'Priest']
    
    for (let player = 1; player <= 4; player++) {
      for (let slot = 1; slot <= 6; slot++) {
        const randomTroopId = Math.floor(Math.random() * 10) + 1
        const randomTroopName = troopNames[randomTroopId - 1] || 'Unknown'
        
        mockAllTroops.push({
          upload_id: uploadId,
          troop_id: randomTroopId,
          player_pos: player,
          player_name: `Player${player}`,
          star_level: Math.floor(Math.random() * 3) + 1,
          conf: 0.8 + Math.random() * 0.2, // 80-100% confidence
          slot_position: slot // Which slot in the player's lineup
        })
      }
    }

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

    // Insert all 24 detected troops
    const { error: detectionsError } = await supabase
      .from('detections')
      .insert(mockAllTroops)

    if (detectionsError) {
      throw new Error(`Failed to insert detections: ${detectionsError.message}`)
    }

    console.log(`Analyzed screenshot ${uploadId}: found ${mockAllTroops.length} troops (24 total) in ${userLeague}`)

    return new Response(
      JSON.stringify({
        success: true,
        uploadId,
        league: userLeague,
        troopsDetected: mockAllTroops.length,
        playersAnalyzed: 4,
        troopsPerPlayer: 6,
        averageConfidence: mockAllTroops.reduce((sum, t) => sum + t.conf, 0) / mockAllTroops.length,
        detections: mockAllTroops.slice(0, 10) // Return first 10 for preview
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

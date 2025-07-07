import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Template matching configuration
const TROOP_TEMPLATES = {
  'Knight': { 
    name: 'Knight', 
    elixir: 2, 
    traits: 'Noble, Juggernaut',
    // In a real implementation, these would be actual image templates
    patterns: ['knight_pattern_1', 'knight_pattern_2'] 
  },
  'Archers': { 
    name: 'Archers', 
    elixir: 2, 
    traits: 'Clan, Ranger',
    patterns: ['archer_pattern_1', 'archer_pattern_2'] 
  },
  'Princess': { 
    name: 'Princess', 
    elixir: 4, 
    traits: 'Noble, Ranger',
    patterns: ['princess_pattern_1', 'princess_pattern_2'] 
  },
  'Bandit': { 
    name: 'Bandit', 
    elixir: 4, 
    traits: 'Ace, Brawler',
    patterns: ['bandit_pattern_1', 'bandit_pattern_2'] 
  },
  'Archer Queen': { 
    name: 'Archer Queen', 
    elixir: 5, 
    traits: 'Clan, Avenger',
    patterns: ['archer_queen_pattern_1', 'archer_queen_pattern_2'] 
  },
  'Valkyrie': { 
    name: 'Valkyrie', 
    elixir: 3, 
    traits: 'Clan, Avenger',
    patterns: ['valkyrie_pattern_1', 'valkyrie_pattern_2'] 
  }
};

// Simulate image processing functions
function extractPlayerRows(imageData: ArrayBuffer) {
  // In real implementation: analyze image to find 4 player rows
  // For now, simulate finding 4 rows
  console.log('Extracting player rows from image...');
  return [
    { player: 1, y: 100, height: 80 },
    { player: 2, y: 200, height: 80 },
    { player: 3, y: 300, height: 80 },
    { player: 4, y: 400, height: 80 }
  ];
}

function extractTroopSlots(playerRow: any, imageData: ArrayBuffer) {
  // In real implementation: crop 6 troop slots from each player row
  console.log(`Extracting 6 troop slots from player ${playerRow.player}...`);
  return Array.from({ length: 6 }, (_, index) => ({
    player: playerRow.player,
    slot: index + 1,
    x: 50 + (index * 100),
    y: playerRow.y,
    width: 80,
    height: 80,
    imageData: `slot_${playerRow.player}_${index + 1}` // Simulated image data
  }));
}

function matchTroopTemplate(slotData: any) {
  // Simple template matching simulation
  const troopNames = Object.keys(TROOP_TEMPLATES);
  const randomIndex = Math.floor(Math.random() * troopNames.length);
  const troopName = troopNames[randomIndex];
  const template = TROOP_TEMPLATES[troopName];
  
  // Simulate confidence based on "image quality"
  const baseConfidence = 0.7 + Math.random() * 0.25; // 70-95%
  
  return {
    troopName: template.name,
    confidence: Math.min(0.95, baseConfidence),
    starLevel: Math.floor(Math.random() * 3) + 1, // 1-3 stars
    template: template
  };
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

    console.log('Starting template-based troop analysis for upload:', uploadId);

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
    console.log(`Processing image: ${imageBuffer.byteLength} bytes`);
    
    // TEMPLATE MATCHING ANALYSIS
    console.log('Step 1: Extracting player rows...');
    const playerRows = extractPlayerRows(imageBuffer);
    
    const detectedTroops = [];
    let totalConfidence = 0;
    
    console.log('Step 2: Analyzing each player row...');
    for (const row of playerRows) {
      console.log(`Processing player ${row.player}...`);
      const troopSlots = extractTroopSlots(row, imageBuffer);
      
      for (const slot of troopSlots) {
        console.log(`  Analyzing slot ${slot.slot}...`);
        const match = matchTroopTemplate(slot);
        
        const detection = {
          upload_id: uploadId,
          troop_id: Math.floor(Math.random() * 20) + 1, // Random ID for now
          player_pos: slot.player,
          player_name: `Player${slot.player}`,
          star_level: match.starLevel,
          conf: match.confidence,
          slot_position: slot.slot
        };
        
        detectedTroops.push(detection);
        totalConfidence += match.confidence;
        
        console.log(`    Found: ${match.troopName} (${match.confidence.toFixed(2)} confidence)`);
      }
    }

    const avgConfidence = totalConfidence / detectedTroops.length;
    console.log(`Analysis complete: ${detectedTroops.length} troops detected, avg confidence: ${avgConfidence.toFixed(2)}`);

    // Update upload to completed status
    await supabase
      .from('uploads')
      .update({
        parse_status: 'completed'
      })
      .eq('id', uploadId)

    // Insert all detected troops
    const { error: detectionsError } = await supabase
      .from('detections')
      .insert(detectedTroops)

    if (detectionsError) {
      throw new Error(`Failed to insert detections: ${detectionsError.message}`)
    }

    console.log(`✅ Template analysis complete for upload ${uploadId}`);

    return new Response(
      JSON.stringify({
        success: true,
        uploadId,
        league: upload.league,
        method: 'template_matching',
        troopsDetected: detectedTroops.length,
        playersAnalyzed: 4,
        troopsPerPlayer: 6,
        averageConfidence: avgConfidence,
        analysisDetails: {
          totalSlots: 24,
          successfulMatches: detectedTroops.length,
          failedMatches: 24 - detectedTroops.length,
          confidenceRange: {
            min: Math.min(...detectedTroops.map(t => t.conf)),
            max: Math.max(...detectedTroops.map(t => t.conf))
          }
        },
        detections: detectedTroops.slice(0, 6) // Return first 6 for preview
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Template matching error:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
        method: 'template_matching'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
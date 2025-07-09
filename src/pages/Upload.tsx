import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload as UploadIcon, FileImage, CheckCircle, AlertCircle, Loader2, Trophy, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UploadedFile {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  id: string;
}

const Upload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<string>("");
  const [leagues, setLeagues] = useState<Array<{id: number, name: string, min_trophies: number, max_trophies: number}>>([]);
  const [showLeagueError, setShowLeagueError] = useState(false);
  const { toast } = useToast();

  // Debug logging
  console.log('Upload component - selectedLeague:', selectedLeague);

  // Fetch leagues on component mount
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const { data: leaguesData, error } = await supabase
          .from('leagues')
          .select('*')
          .order('id');
        
        if (error) throw error;
        setLeagues(leaguesData || []);
      } catch (error) {
        console.error('Error fetching leagues:', error);
        toast({
          title: "Error",
          description: "Failed to load leagues",
          variant: "destructive"
        });
      }
    };
    
    fetchLeagues();
  }, [toast]);

  const handleFiles = useCallback((files: File[]) => {
    console.log('handleFiles called with selectedLeague:', selectedLeague);
    
    // Validate league selection first
    if (!selectedLeague || selectedLeague.trim() === "") {
      console.log('No league selected, showing error');
      setShowLeagueError(true);
      toast({
        title: "League Required",
        description: "Please select your league before uploading.",
        variant: "destructive"
      });
      return;
    }
    
    // Clear any previous league errors
    setShowLeagueError(false);

    files.forEach(async (file) => {
      // Validate file type
      if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a valid image file. Please use PNG or JPG.`,
          variant: "destructive"
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} is larger than 5MB. Please use a smaller file.`,
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const newFile: UploadedFile = {
          file,
          preview: e.target?.result as string,
          status: 'pending',
          id: Date.now().toString() + Math.random().toString(36)
        };

        setUploadedFiles(prev => [...prev, newFile]);
        
        // Start actual upload process
        setUploadedFiles(prev => 
          prev.map(f => f.id === newFile.id ? { ...f, status: 'uploading' } : f)
        );

        try {
          // Generate unique filename
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(2, 8);
          const fileExtension = file.name.split('.').pop();
          const fileName = `screenshot_${timestamp}_${randomSuffix}.${fileExtension}`;
          const filePath = `screenshots/${fileName}`;

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('screenshots')
            .upload(filePath, file);

          if (uploadError) {
            throw uploadError;
          }

          // Create database record with league data
          const { data: uploadRecord, error: dbError } = await supabase
            .from('uploads')
            .insert({
              filename: file.name,
              storage_path: filePath,
              parse_status: 'pending',
              league: selectedLeague
            })
            .select()
            .single();

          if (dbError || !uploadRecord) {
            throw dbError;
          }

          // Analysis will be added later with vision API

          // Mark as completed
          setUploadedFiles(prev => 
            prev.map(f => f.id === newFile.id ? { ...f, status: 'completed' } : f)
          );
          
          // Special thank you toast with game theme
          setTimeout(() => {
            toast({
              title: "🏆 Thank You, Champion!",
              description: "Your contribution helps the entire Merge Tactics community! Analysis will be implemented soon.",
            });
          }, 500);
          
          toast({
            title: "Upload Complete",
            description: `${file.name} uploaded successfully!`,
          });
        } catch (error) {
          console.error('Upload error:', error);
          
          setUploadedFiles(prev => 
            prev.map(f => f.id === newFile.id ? { ...f, status: 'error' } : f)
          );
          
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive"
          });
        }
      };
      reader.readAsDataURL(file);
    });
  }, [selectedLeague, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [handleFiles]); // Updated dependency

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
      // Reset the input so the same file can be selected again
      e.target.value = '';
    }
  }, [handleFiles]); // Updated dependency

  // Function to clear completed uploads and allow new ones
  const clearCompletedUploads = () => {
    setUploadedFiles(prev => prev.filter(file => file.status !== 'completed'));
    console.log('Cleared completed uploads, ready for new uploads');
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'uploading':
        return <div className="h-5 w-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />;
      default:
        return <FileImage className="h-5 w-5 text-accent" />;
    }
  };

  return (
    <Layout>
      <div className="container py-12 space-y-8 relative z-10">
        {/* Go Back Button */}
        <div className="flex justify-start">
          <Button 
            asChild 
            variant="outline" 
            className="font-game-title border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground shadow-game transition-all duration-200 hover:scale-105"
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" strokeWidth={3} />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-5xl font-game-title text-game-title text-foreground">
            Upload Screenshots
          </h1>
          <p className="text-xl font-game-body text-foreground/90 max-w-2xl mx-auto">
            Share your Merge Tactics victory screenshots to help build the community meta database
          </p>
        </div>


        {/* League Selection */}
        <div className="max-w-2xl mx-auto">
          <div className="game-card">
            <CardHeader style={{
              background: 'var(--gradient-accent)',
              borderBottom: '4px solid hsl(var(--accent))'
            }}>
              <CardTitle className="font-game-title text-xl text-accent-foreground flex items-center gap-3">
                <Trophy className="h-6 w-6 animate-bounce-subtle" strokeWidth={3} />
                Your League
              </CardTitle>
              <CardDescription className="font-game text-accent-foreground/80">
                Select your current league for accurate analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Label className="text-lg font-game-title text-foreground">League</Label>
                <Select value={selectedLeague} onValueChange={(value) => {
                  setSelectedLeague(value);
                  setShowLeagueError(false); // Clear error when league is selected
                  console.log('League selected:', value);
                }}>
                  <SelectTrigger className="h-12 bg-gradient-primary border-3 border-accent font-game text-foreground shadow-game hover:scale-105 transition-transform">
                    <SelectValue placeholder="Choose your league..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gradient-primary border-3 border-accent shadow-game z-50">
                    {leagues.map((league) => (
                      <SelectItem 
                        key={league.id} 
                        value={league.name}
                        className="font-game text-foreground hover:bg-gradient-winner focus:bg-gradient-winner cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-4 w-4 text-accent" strokeWidth={3} />
                          <span>{league.name}</span>
                          <span className="text-xs text-foreground/60">
                            ({league.min_trophies}-{league.max_trophies >= 9999 ? '∞' : league.max_trophies})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedLeague && (
                  <p className="text-sm font-game text-accent">
                    ✓ Ready to upload for {selectedLeague}
                  </p>
                )}
                <div className="text-xs font-mono text-foreground/50 mt-2">
                  Debug: selectedLeague = "{selectedLeague}"
                </div>
              </div>

              {!selectedLeague && (
                <div className="mt-4 p-4 rounded-lg bg-accent/10 border-2 border-accent/30">
                  <p className="text-sm font-game text-foreground/80 text-center">
                    📋 Please select your league before uploading
                  </p>
                </div>
              )}
            </CardContent>
          </div>
        </div>

        {/* Upload Area */}
        <div className="max-w-2xl mx-auto">
          <div className="game-card">
            <CardHeader style={{
              background: 'var(--gradient-winner)',
              borderBottom: '4px solid hsl(var(--accent))'
            }}>
              <CardTitle className="font-game-title text-xl text-accent-foreground">
                Screenshot Upload
              </CardTitle>
              <CardDescription className="font-game text-accent-foreground/80">
                PNG or JPG files, max 5MB, minimum 1280x720 resolution
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div
                className={`border-4 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDragging 
                    ? 'border-accent bg-accent/10' 
                    : 'border-accent/50 hover:border-accent hover:bg-accent/5'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
              >
                <UploadIcon className="h-16 w-16 text-accent mx-auto mb-4 animate-bounce-subtle" strokeWidth={2} />
                <h3 className="text-xl font-game-title text-foreground mb-2">
                  Drop your screenshots here
                </h3>
                <p className="text-foreground/80 font-game mb-4">
                  or click to browse files
                </p>
                
                {/* Example Image */}
                <div className="mb-4 p-3 bg-gradient-primary rounded-lg border-2 border-accent/30 shadow-game">
                  <h4 className="text-sm font-game-title text-foreground mb-2 text-center">
                    ✨ Perfect Example
                  </h4>
                  <img 
                    src="/lovable-uploads/381669af-ad51-41b2-95c7-cd0771938a0a.png" 
                    alt="Example screenshot"
                    className="w-40 h-28 mx-auto rounded border-2 border-accent/50 object-cover hover:scale-105 transition-transform"
                  />
                  <p className="text-xs font-game text-accent/80 mt-1 text-center">
                    Victory screen layout
                  </p>
                </div>
                
                <Label htmlFor="file-upload">
                  <Button 
                    asChild
                    className="font-game-title bg-gradient-primary hover:scale-105 transition-transform shadow-game mr-3"
                  >
                    <span>Choose Files</span>
                  </Button>
                </Label>
                
                {uploadedFiles.length > 0 && uploadedFiles.some(f => f.status === 'pending') && (
                  <Button
                    onClick={() => {
                      // Clear completed files and show processing message
                      setUploadedFiles(prev => prev.filter(f => f.status !== 'completed'));
                      toast({
                        title: "Files Sent!",
                        description: "Your screenshots are being processed. Thank you for contributing!",
                      });
                    }}
                    className="font-game-title bg-gradient-winner hover:scale-105 transition-transform shadow-game"
                  >
                    <UploadIcon className="h-4 w-4 mr-2" strokeWidth={3} />
                    Send {uploadedFiles.filter(f => f.status === 'pending').length} File{uploadedFiles.filter(f => f.status === 'pending').length > 1 ? 's' : ''} for Analysis
                  </Button>
                )}
                
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
              
              {/* League Required Error Message */}
              {showLeagueError && (
                <div className="mt-4 p-4 rounded-lg bg-red-500/10 border-2 border-red-500/50">
                  <p className="text-sm font-game text-red-400 text-center">
                    ❌ League Required: Please select your league before uploading
                  </p>
                </div>
              )}
            </CardContent>
          </div>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="game-card">
              <CardHeader style={{
                background: 'var(--gradient-silver)',
                borderBottom: '4px solid hsl(var(--accent))'
              }}>
                <CardTitle className="font-game-title text-xl text-foreground">
                  Upload Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadedFiles.map((file) => (
                    <div 
                      key={file.id}
                      className="flex items-center space-x-4 p-4 bg-card rounded-lg border-2 border-accent/30 hover:border-accent/60 transition-colors"
                    >
                      <img 
                        src={file.preview} 
                        alt={file.file.name}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-accent"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-game-title text-sm text-foreground truncate">
                          {file.file.name}
                        </h4>
                        <p className="text-xs font-game text-foreground/60">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusIcon(file.status)}
                          <span className="text-xs font-game text-foreground/80 capitalize">
                            {file.status === 'uploading' ? 'Processing...' : file.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Show "Upload More" button if there are completed uploads */}
                {uploadedFiles.some(f => f.status === 'completed') && (
                  <div className="mt-6 text-center">
                    <Button
                      onClick={clearCompletedUploads}
                      className="font-game-title bg-gradient-accent hover:scale-105 transition-transform shadow-game"
                    >
                      <UploadIcon className="h-4 w-4 mr-2" strokeWidth={3} />
                      Upload More Screenshots
                    </Button>
                  </div>
                )}
              </CardContent>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="max-w-2xl mx-auto">
          <div className="game-card">
            <CardHeader style={{
              background: 'var(--gradient-primary)',
              borderBottom: '4px solid hsl(var(--accent))'
            }}>
              <CardTitle className="font-game-title text-xl text-foreground">
                Upload Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 font-game text-foreground">
              <div className="flex items-start space-x-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-game-title">
                  1
                </div>
                <p>Take screenshots after victory to show final troop compositions</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-game-title">
                  2
                </div>
                <p>Ensure all player rows and troops are clearly visible</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-game-title">
                  3
                </div>
                <p>Include the league badge for accurate categorization</p>
              </div>
            </CardContent>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Upload;
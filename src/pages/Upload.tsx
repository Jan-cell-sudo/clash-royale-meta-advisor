import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload as UploadIcon, FileImage, CheckCircle, AlertCircle, Wand2, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { removeBackground, loadImage } from "@/lib/imageProcessing";

interface UploadedFile {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'processing';
  id: string;
  processedPreview?: string;
}

const Upload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [enhanceImages, setEnhanceImages] = useState(false);
  const [processingBackground, setProcessingBackground] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  }, []);

  const handleFiles = (files: File[]) => {
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
        
        // Enhanced image processing if enabled
        if (enhanceImages) {
          setUploadedFiles(prev => 
            prev.map(f => f.id === newFile.id ? { ...f, status: 'processing' } : f)
          );
          setProcessingBackground(newFile.id);
          
          try {
            const img = await loadImage(file);
            const enhancedBlob = await removeBackground(img);
            
            // Convert blob to data URL for preview
            const enhancedReader = new FileReader();
            enhancedReader.onload = (enhancedE) => {
              setUploadedFiles(prev => 
                prev.map(f => f.id === newFile.id ? 
                  { ...f, processedPreview: enhancedE.target?.result as string } : f
                )
              );
            };
            enhancedReader.readAsDataURL(enhancedBlob);
            
            // Use enhanced file for upload
            file = new File([enhancedBlob], file.name.replace(/\.[^/.]+$/, '_enhanced.png'), {
              type: 'image/png'
            });
          } catch (error) {
            console.error('Image enhancement failed:', error);
            toast({
              title: "Enhancement Failed",
              description: "Proceeding with original image.",
            });
          } finally {
            setProcessingBackground(null);
          }
        }
        
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

          // Create database record
          const { data: uploadRecord, error: dbError } = await supabase
            .from('uploads')
            .insert({
              filename: file.name,
              storage_path: filePath,
              parse_status: 'pending'
            })
            .select()
            .single();

          if (dbError || !uploadRecord) {
            throw dbError;
          }

          // Trigger AI analysis
          const { data: analysisResult, error: analysisError } = await supabase.functions
            .invoke('analyze-screenshot', {
              body: { uploadId: uploadRecord.id }
            });

          if (analysisError) {
            console.error('Analysis error:', analysisError);
            // Don't throw - file was uploaded successfully, analysis can retry later
          }

          // Mark as completed
          setUploadedFiles(prev => 
            prev.map(f => f.id === newFile.id ? { ...f, status: 'completed' } : f)
          );
          
          // Special thank you toast with game theme
          setTimeout(() => {
            toast({
              title: "🏆 Thank You, Champion!",
              description: `Your contribution helps the entire Merge Tactics community! ${analysisResult?.success ? `Found ${analysisResult.troopsDetected} troops in ${analysisResult.league}.` : 'Analysis processing...'}`,
            });
          }, 500);
          
          toast({
            title: "Upload Complete",
            description: `${file.name} uploaded successfully! Processing analysis...`,
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
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
      case 'uploading':
        return <div className="h-5 w-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />;
      default:
        return <FileImage className="h-5 w-5 text-accent" />;
    }
  };

  return (
    <Layout>
      <div className="container py-12 space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-game-title text-game-title text-foreground">
            Upload Screenshots
          </h1>
          <p className="text-xl font-game-body text-foreground/90 max-w-2xl mx-auto">
            Share your Merge Tactics victory screenshots to help build the community meta database
          </p>
        </div>

        {/* Enhanced Settings */}
        <div className="max-w-2xl mx-auto">
          <div className="game-card">
            <CardHeader style={{
              background: 'var(--gradient-accent)',
              borderBottom: '4px solid hsl(var(--accent))'
            }}>
              <CardTitle className="font-game-title text-xl text-accent-foreground flex items-center gap-3">
                <Wand2 className="h-6 w-6 animate-bounce-subtle" strokeWidth={3} />
                AI Enhancement
              </CardTitle>
              <CardDescription className="font-game text-accent-foreground/80">
                Enable background removal for cleaner analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Switch
                  id="enhance-images"
                  checked={enhanceImages}
                  onCheckedChange={setEnhanceImages}
                />
                <Label htmlFor="enhance-images" className="font-game text-foreground cursor-pointer">
                  Remove background automatically (experimental)
                </Label>
              </div>
              {enhanceImages && (
                <div className="mt-4 p-4 rounded-lg bg-accent/10 border-2 border-accent/30">
                  <p className="text-sm font-game text-foreground/80">
                    🔬 This feature uses AI to remove backgrounds, which may take a few seconds per image.
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
                    className="w-32 h-20 mx-auto rounded border-2 border-accent/50 object-cover hover:scale-105 transition-transform"
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
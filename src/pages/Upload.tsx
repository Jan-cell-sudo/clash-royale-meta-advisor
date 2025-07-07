import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload as UploadIcon, FileImage, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  id: string;
}

const Upload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
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
    files.forEach(file => {
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
      reader.onload = (e) => {
        const newFile: UploadedFile = {
          file,
          preview: e.target?.result as string,
          status: 'pending',
          id: Date.now().toString() + Math.random().toString(36)
        };

        setUploadedFiles(prev => [...prev, newFile]);
        
        // Simulate upload process
        setTimeout(() => {
          setUploadedFiles(prev => 
            prev.map(f => f.id === newFile.id ? { ...f, status: 'uploading' } : f)
          );
          
          setTimeout(() => {
            setUploadedFiles(prev => 
              prev.map(f => f.id === newFile.id ? { ...f, status: 'completed' } : f)
            );
            
            toast({
              title: "Upload Complete",
              description: `${file.name} has been processed! AI analysis will be available soon.`,
            });
          }, 2000);
        }, 500);
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
                <Label htmlFor="file-upload">
                  <Button 
                    asChild
                    className="font-game-title bg-gradient-primary hover:scale-105 transition-transform shadow-game"
                  >
                    <span>Choose Files</span>
                  </Button>
                </Label>
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
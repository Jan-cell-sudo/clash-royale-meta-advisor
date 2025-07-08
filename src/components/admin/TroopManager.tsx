import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TroopForm {
  name: string;
  description: string;
  trait_family: string;
  image: File | null;
}

export function TroopManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<TroopForm>({
    name: "",
    description: "",
    trait_family: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({
        title: "Error",
        description: "Troop name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get the next available ID
      const { data: existingTroops, error: fetchError } = await supabase
        .from('troop_types')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const nextId = existingTroops && existingTroops.length > 0 
        ? existingTroops[0].id + 1 
        : 1;

      let imageUrl = null;

      // Upload image if provided
      if (form.image) {
        const fileExt = form.image.name.split('.').pop();
        const fileName = `${form.name.toLowerCase().replace(/\s+/g, '-')}-${nextId}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('troop-images')
          .upload(fileName, form.image, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Failed to upload image');
        }

        // Get the public URL
        const { data } = supabase.storage
          .from('troop-images')
          .getPublicUrl(fileName);
        
        imageUrl = data.publicUrl;
      }

      // Insert the new troop
      const { error: insertError } = await supabase
        .from('troop_types')
        .insert({
          id: nextId,
          name: form.name.trim(),
          description: form.description.trim() || null,
          trait_family: form.trait_family.trim() || null,
        });

      if (insertError) throw insertError;

      // Update TroopImage mapping if image was uploaded
      if (imageUrl) {
        toast({
          title: "Success",
          description: `Troop "${form.name}" added with image! Remember to update the TroopImage component mapping.`,
        });
      } else {
        toast({
          title: "Success",
          description: `Troop "${form.name}" added successfully!`,
        });
      }

      // Reset form
      setForm({
        name: "",
        description: "",
        trait_family: "",
        image: null,
      });
      setImagePreview(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding troop:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add troop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      trait_family: "",
      image: null,
    });
    setImagePreview(null);
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full bg-gradient-primary hover:bg-gradient-winner text-accent-foreground font-game-title"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Troop (Admin Only)
        </Button>
      ) : (
        <Card className="game-card">
          <CardHeader style={{
            background: 'var(--gradient-winner)',
            borderBottom: '4px solid hsl(var(--accent))'
          }}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 font-game-title text-xl text-accent-foreground">
                <Plus className="h-6 w-6" />
                Add New Troop
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetForm}
                className="text-accent-foreground hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name" className="font-game-title text-foreground">
                    Troop Name *
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter troop name..."
                    className="font-game"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="trait_family" className="font-game-title text-foreground">
                    Trait Family
                  </Label>
                  <Input
                    id="trait_family"
                    value={form.trait_family}
                    onChange={(e) => setForm(prev => ({ ...prev, trait_family: e.target.value }))}
                    placeholder="e.g., Goblin, Human, Undead..."
                    className="font-game"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="font-game-title text-foreground">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter troop description..."
                    className="font-game min-h-[80px]"
                  />
                </div>

                <div>
                  <Label htmlFor="image" className="font-game-title text-foreground">
                    Troop Image
                  </Label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="font-game"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image')?.click()}
                        className="font-game-title"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                    
                    {imagePreview && (
                      <div className="mt-4">
                        <div className="w-32 h-32 rounded-xl border-4 border-accent overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-primary hover:bg-gradient-winner text-accent-foreground font-game-title"
                >
                  {loading ? "Adding..." : "Add Troop"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="font-game-title"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
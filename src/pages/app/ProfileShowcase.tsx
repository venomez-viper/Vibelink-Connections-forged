import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, MapPin, Heart, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  age: number;
  location: string;
  bio: string;
  tagline: string;
  profile_photo_url: string;
}

interface Media {
  id: string;
  media_url: string;
  media_type: string;
  caption: string;
  likes_count: number;
  created_at: string;
}

const ProfileShowcase = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [caption, setCaption] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const isOwnProfile = currentUserId === userId;

  useEffect(() => {
    checkAuth();
    loadProfile();
    loadMedia();
  }, [userId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    setCurrentUserId(session.user.id);
  };

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMedia = async () => {
    try {
      const { data, error } = await supabase
        .from("user_media")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error("Error loading media:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select an image (JPEG, PNG, GIF, WEBP) or video (MP4)",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("user-media")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("user-media")
        .getPublicUrl(fileName);

      const mediaType = file.type.startsWith("video") ? "video" : "photo";

      const { error: insertError } = await supabase
        .from("user_media")
        .insert({
          user_id: currentUserId,
          media_url: publicUrl,
          media_type: mediaType,
          caption: caption,
        });

      if (insertError) throw insertError;

      toast({
        title: "Upload successful!",
        description: "Your media has been added to your profile",
      });

      setCaption("");
      loadMedia();
    } catch (error) {
      console.error("Error uploading media:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your media",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      const { error } = await supabase
        .from("user_media")
        .delete()
        .eq("id", mediaId);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Media deleted successfully",
      });

      loadMedia();
    } catch (error) {
      console.error("Error deleting media:", error);
      toast({
        title: "Error",
        description: "Failed to delete media",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 to-purple-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
            <Button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 to-purple-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-32 w-32 ring-4 ring-white shadow-xl">
                <AvatarImage src={profile.profile_photo_url} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-4xl">
                  {profile.first_name[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">
                  {profile.first_name}, {profile.age}
                </h1>
                {profile.tagline && (
                  <p className="text-lg italic text-muted-foreground mb-2">
                    &quot;{profile.tagline}&quot;
                  </p>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{profile.location}</span>
                  </div>
                )}
              </div>
            </div>

            {profile.bio && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-2">About Me</h3>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Section (only for own profile) */}
        {isOwnProfile && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Upload Photos & Videos</h3>
              <div className="space-y-4">
                <Textarea
                  placeholder="Add a caption (optional)"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*,video/mp4"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                  {uploading && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Media Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {isOwnProfile ? "My Gallery" : `${profile.first_name}'s Gallery`}
          </h2>

          {media.length === 0 ? (
            <Card className="p-12 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {isOwnProfile
                  ? "No media yet. Upload your first photo or video!"
                  : "No media shared yet"}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {media.map((item) => (
                <Card key={item.id} className="overflow-hidden hover-scale group">
                  <div className="relative aspect-square">
                    {item.media_type === "video" ? (
                      <video
                        src={item.media_url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={item.media_url}
                        alt={item.caption || "Media"}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {isOwnProfile && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteMedia(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {item.caption && (
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">{item.caption}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Heart className="h-3 w-3" />
                        <span>{item.likes_count} likes</span>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

    </div>
  );
};

export default ProfileShowcase;

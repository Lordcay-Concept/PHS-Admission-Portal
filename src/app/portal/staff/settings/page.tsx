"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Camera, Save, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export default function StaffSettings() {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setFullName(data.display_name || "");
          setProfilePic(data.avatar_url || null);
        }
      }
      setFetching(false);
    }
    loadProfile();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `staff-pics/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setProfilePic(publicUrl);
    } catch (error: any) {
      alert(error.message || "Error uploading image");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName) return alert("Please enter a name.");
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        display_name: fullName,
        avatar_url: profilePic,
       updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id'
    });

      if (error) throw error;
      
      alert("Profile saved successfully!");
      router.push("/portal/staff");
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-red-900" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <Link 
        href="/portal/staff" 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-red-900 font-bold text-xs uppercase tracking-widest mb-6 transition-colors group"
      >
        <div className="p-2 rounded-full bg-slate-100 group-hover:bg-red-100 transition-colors">
          <ChevronLeft size={16} />
        </div>
        Back to Dashboard
      </Link>
      
      <h1 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Settings</h1>
      
      <div className="space-y-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="flex items-center gap-6 mb-8">
             
             <input 
               type="file" 
               accept="image/*" 
               className="hidden" 
               ref={fileInputRef} 
               onChange={handleImageUpload} 
               disabled={loading}
             />

             <div 
               className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-300 relative group overflow-hidden cursor-pointer"
               onClick={() => fileInputRef.current?.click()}
             >
               {profilePic ? (
                 <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <User className="text-slate-400" size={32} />
               )}
               <div className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                 {loading ? <Loader2 className="animate-spin" size={24} /> : <Camera size={24} />}
               </div>
             </div>
             
             <div>
               <h3 className="font-bold text-lg">Profile Photo</h3>
               <p className="text-sm text-slate-500">Click the box to update your picture.</p>
             </div>
           </div>

           <div className="grid gap-4">
              <label className="text-xs font-bold uppercase text-slate-400 px-1">Display Name</label>
              <Input 
                placeholder="Full Name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-xl h-12" 
              />
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="w-full bg-red-900 hover:bg-red-800 h-12 rounded-xl font-bold gap-2 text-white"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {loading ? "Saving..." : "Save Profile Changes"}
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
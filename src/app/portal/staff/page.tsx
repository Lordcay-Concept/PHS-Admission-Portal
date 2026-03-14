"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  FileSpreadsheet, 
  BookOpen, 
  UserCircle, 
  ArrowRight, 
  Settings, 
  LogOut,
  Calendar 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StaffPortal() {
  const [profile, setProfile] = useState<any>(null);
  const [hasNewUpdate, setHasNewUpdate] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
    }

    async function checkUpdates() {
      try {
        const { data } = await supabase
          .from("schedule_metadata")
          .select("last_updated_at")
          .eq("id", 1)
          .single();

        if (data) {
          const lastDbUpdate = new Date(data.last_updated_at).getTime();
          const lastViewed = localStorage.getItem("last_viewed_schedule");
          const lastViewedTime = lastViewed ? new Date(lastViewed).getTime() : 0;

          if (lastDbUpdate > lastViewedTime) {
            setHasNewUpdate(true);
          }
        }
      } catch (error) {
        console.error("Update check failed", error);
      }
    }

    getProfile();
    checkUpdates();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/login");
      router.refresh();
    } else {
      console.error("Error logging out:", error.message);
    }
  };

  const displayName = profile?.display_name ? `Welcome, ${profile.display_name.split(' ')[0]}` : "Staff Dashboard";

  return (
   <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
              <AvatarImage src={profile?.avatar_url} className="object-cover" />
              <AvatarFallback className="bg-red-900 text-white font-bold">
                {profile?.display_name?.charAt(0) || "S"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                {displayName}
              </h1>
              <p className="text-slate-500 font-medium italic">Role: Academic Instructor</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/portal/staff/settings">
              <Button variant="outline" className="rounded-xl gap-2 font-bold text-slate-600">
                <Settings size={18} /> {profile ? "Update Profile" : "Set Up Profile"}
              </Button>
            </Link>
            <Button 
              onClick={() => { handleLogout() }} 
              variant="ghost" 
              className="rounded-xl gap-2 font-bold text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} /> Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/portal/staff/result" className="group">
            <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2.5rem] overflow-hidden group-hover:-translate-y-2">
              <div className="bg-red-900 p-8 text-white">
                <FileSpreadsheet size={40} className="mb-4 text-red-200" />
                <h2 className="text-2xl font-black uppercase leading-none">Result<br/>Spreadsheet</h2>
              </div>
              <CardContent className="p-8">
                <p className="text-slate-500 text-sm mb-6">Enter CA scores, exam marks, and generate student grades.</p>
                <div className="flex items-center text-red-900 font-black uppercase text-xs tracking-widest gap-2 group-hover:gap-4 transition-all">
                  Open Spreadsheet <ArrowRight size={16} />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/portal/staff/resources" className="group">
            <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2.5rem] overflow-hidden group-hover:-translate-y-2">
              <div className="bg-slate-800 p-8 text-white">
                <BookOpen size={40} className="mb-4 text-slate-400" />
                <h2 className="text-2xl font-black uppercase leading-none">Learning<br/>Resources</h2>
              </div>
              <CardContent className="p-8">
                <p className="text-slate-500 text-sm mb-6">Upload lecture notes and assignment PDFs for your students.</p>
                <div className="flex items-center text-slate-800 font-black uppercase text-xs tracking-widest gap-2 group-hover:gap-4 transition-all">
                   Manage Materials <ArrowRight size={16} />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/portal/staff/class" className="group">
            <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2.5rem] overflow-hidden group-hover:-translate-y-2">
              <div className="bg-slate-200 p-8 text-slate-600">
                <UserCircle size={40} className="mb-4 text-slate-400" />
                <h2 className="text-2xl font-black uppercase leading-none text-slate-900">Class<br/>Information</h2>
              </div>
              <CardContent className="p-8">
                <p className="text-slate-500 text-sm mb-6">View student lists and manage daily attendance.</p>
                <div className="flex items-center text-slate-600 font-black uppercase text-xs tracking-widest gap-2 group-hover:gap-4 transition-all">
                   Open Register <ArrowRight size={16} />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="bg-white border border-slate-100 p-8 rounded-[2rem] flex items-center justify-between shadow-sm relative overflow-hidden">
          {hasNewUpdate && (
            <div className="absolute top-4 left-4 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <div className="bg-green-100 text-green-700 p-3 rounded-2xl">
              <Calendar size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Termly Schedule</h4>
              <p className="text-sm text-slate-500">Official school activities for this term.</p>
            </div>
          </div>
          <Link href="/portal/staff/schedule">
            <Button className="bg-slate-900 text-white rounded-xl font-bold px-6">View Schedule</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
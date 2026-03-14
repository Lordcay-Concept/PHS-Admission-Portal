"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  User, FileText, BookOpen, LogOut, 
  GraduationCap, LayoutDashboard, ChevronLeft 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isCheckPage = pathname === "/portal/student/check";
  if (isCheckPage) return <>{children}</>;

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/portal/student/dashboard" },
    { name: "My Profile", icon: User, path: "/portal/student/profile" },
    { name: "Term Results", icon: FileText, path: "/portal/student/results" },
    { name: "Learning Materials", icon: BookOpen, path: "/portal/student/materials" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("student_id");
    router.push("/portal/student/check");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-50 print:hidden">
        
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3 text-red-900">
            <div className="bg-red-900 p-2 rounded-xl text-white shadow-lg shadow-red-900/20">
              <GraduationCap size={24} />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase leading-none">PHS Portal</span>
          </div>

          {pathname !== "/portal/student/dashboard" && (
            <Button 
              variant="outline"
              onClick={() => router.push("/portal/student/dashboard")}
              className="w-full justify-start gap-2 border-slate-100 rounded-xl font-bold text-slate-500 hover:bg-slate-50 hover:text-red-900 transition-all h-12"
            >
              <ChevronLeft size={18} /> Back to Home
            </Button>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-4">Main Menu</p>
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all text-sm",
                pathname === item.path 
                  ? "bg-red-900 text-white shadow-xl shadow-red-900/20 scale-[1.02]" 
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              <item.icon size={20} /> {item.name}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start gap-4 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-2xl font-bold h-14"
          >
            <LogOut size={20} /> Exit Portal
          </Button>
        </div>
      </aside>

      <main className="flex-1 ml-72 p-8 md:p-12 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
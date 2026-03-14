"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; 
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, BookOpen, UserRound, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

 const noNavbarRoutes = [
    "/login", "/signup", "/portal/dashboard", "/admin/dashboard", 
    "/portal/student/check", "/portal/student/result", "/admin/approval", 
    "/admin/check-result", "/admin/feedback", "/admin/newsletter",
    "/admin/upload-result", "/admin/students", "/portal/staff/result", 
    "/portal/staff", "/portal/staff/settings", "/portal/staff/class", 
    "/portal/staff/resources", "/portal/staff/schedule", "/admin/schedule", 
    "/admin/admissions", "/admin/transcript", "/admin/settings", 
    "/portal/student/dashboard", "/portal/student/layout", 
    "/portal/student/materials", "/portal/student/profile"
  ];

  const shouldHideNavbar = 
    noNavbarRoutes.includes(pathname) || 
    pathname.startsWith("/admin/admissions/") || 
    pathname.startsWith("/admission-letter/") || 
    pathname.startsWith("/portal/admission-letter/");

  if (shouldHideNavbar) {
    return null; 
  }
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md py-3 transition-all duration-300">
      <div className="container mx-auto px-4 flex justify-between items-center">
        
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-12 h-12 md:w-14 md:h-14">
           <Image 
              src="/images/logo/PHS Logo.webp" 
              alt="School Logo" 
              width={100} 
              height={100} 
              sizes="(max-width: 768px) 100px, 100px"
            />
          </div>
          <span className="text-xl md:text-2xl font-black text-red-900 leading-none">
            Possible Height<br/>
            <span className="text-xs text-gray-500 tracking-widest uppercase">Schools</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-red-900 transition-colors">Home</Link>
          <Link href="/admission" className="text-sm font-medium text-gray-700 hover:text-red-900 transition-colors">Admission</Link>
          <Link href="/#facilities" className="text-sm font-medium text-gray-700 hover:text-red-900 transition-colors">Facilities</Link>
          <Link href="/#gallery" className="text-sm font-medium text-gray-700 hover:text-red-900 transition-colors">Gallery</Link>
          <Link href="/#contact" className="text-sm font-medium text-gray-700 hover:text-red-900 transition-colors">Contact Us</Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-red-900 transition-colors outline-none">
              About Us <ChevronDown size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-white border-red-100 p-2 shadow-lg rounded-xl mt-2">
              <DropdownMenuItem asChild className="group cursor-pointer p-3 rounded-lg hover:bg-red-50 transition-colors focus:bg-red-50">
                <Link href="/about" className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full text-red-900 group-hover:bg-red-200">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-red-900">Our Identity</p>
                    <p className="text-xs text-gray-500">Mission, Vision & History</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild className="group cursor-pointer p-3 rounded-lg hover:bg-red-50 transition-colors focus:bg-red-50 mt-1">
                <Link href="/about#proprietress" className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full text-red-900 group-hover:bg-red-200">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-red-900">Proprietress Message</p>
                    <p className="text-xs text-gray-500">A word from our founder</p>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="group cursor-pointer p-3 rounded-lg hover:bg-red-50 transition-colors focus:bg-red-50 mt-1">
                <Link href="/about#curriculum" className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full text-red-900 group-hover:bg-red-200">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-red-900">Our Curriculum</p>
                    <p className="text-xs text-gray-500">Academic Standards</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/admission">
            <Button className="bg-red-900 hover:bg-red-800 text-white font-semibold rounded-full px-6">
              Enrol Your Child →
            </Button>
          </Link>
        </div>

        <button className="md:hidden text-red-900" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg p-4 flex flex-col gap-4 md:hidden border-t border-gray-100">
           <Link href="/" onClick={() => setIsOpen(false)} className="text-gray-800 font-medium py-2 border-b border-gray-50 hover:text-red-900">Home</Link>
           <Link href="/about" onClick={() => setIsOpen(false)} className="text-gray-800 font-medium py-2 border-b border-gray-50 hover:text-red-900">About Us</Link>
           <Link href="/admission" onClick={() => setIsOpen(false)} className="text-gray-800 font-medium py-2 border-b border-gray-50 hover:text-red-900">Admission</Link>
           <Link href="/#contact" onClick={() => setIsOpen(false)} className="text-gray-800 font-medium py-2 border-b border-gray-50 hover:text-red-900">Contact Us</Link>
          <Link href="/#gallery" onClick={() => setIsOpen(false)} className="text-gray-800 font-medium py-2 border-b border-gray-50 hover:text-red-900">Gallery</Link>
          <Link href="/#facilities" onClick={() => setIsOpen(false)} className="text-gray-800 font-medium py-2 border-b border-gray-50 hover:text-red-900">Facilities</Link>

           <Link href="/admission">
            <Button className="w-full bg-red-900 rounded-full py-3">Enrol Now</Button>
           </Link>
        </div>
      )}
    </nav>
  );
}
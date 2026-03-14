"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Facebook, Twitter, Youtube, ArrowUp, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Footer() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const scrollToTop = () => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleNewsletter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);

        const { error } = await supabase
            .from("newsletter")
            .insert([{ email, created_at: new Date() }]);

        if (error) {
            toast.error("Subscription failed or email already exists");
        } else {
            toast.success("Successfully subscribed to newsletter!");
            setEmail("");
        }
        setLoading(false);
    };

    return (
        <footer className="bg-slate-50 pt-20 pb-10 relative overflow-hidden border-t border-slate-200">
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] rotate-180 pointer-events-none">
                <svg
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                    className="relative block w-full h-[150px] fill-slate-200/40"
                >
                    <path
                        d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                        opacity=".25"
                    ></path>
                </svg>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="relative w-12 h-12">
                                <Image
                                    src="/images/logo/PHS Logo.webp"
                                    alt="Possible Height Logo"
                                    fill
                                    sizes="100px"
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-xl font-bold text-red-900 leading-none">
                                Possible Height
                                <br />
                                <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                                    Schools
                                </span>
                            </span>
                        </Link>
                        <div className="flex gap-4">
                            <Link href="#" className="w-10 h-10 bg-white shadow-sm rounded-lg flex items-center justify-center text-slate-600 hover:bg-red-900 hover:text-white transition-all border border-slate-100">
                                <Facebook size={18} />
                            </Link>
                            <Link href="#" className="w-10 h-10 bg-white shadow-sm rounded-lg flex items-center justify-center text-slate-600 hover:bg-red-900 hover:text-white transition-all border border-slate-100">
                                <Twitter size={18} />
                            </Link>
                            <Link href="#" className="w-10 h-10 bg-white shadow-sm rounded-lg flex items-center justify-center text-slate-600 hover:bg-red-900 hover:text-white transition-all border border-slate-100">
                                <Youtube size={18} />
                            </Link>
                        </div>
                        <Link href="/#contact">
                            <Button className="bg-red-900 hover:bg-red-800 text-white rounded-full px-8 py-6 font-bold shadow-lg shadow-red-100 border-none transition-transform hover:scale-105">
                                Contact Us →
                            </Button>
                        </Link>
                    </div>

                    <div className="text-center md:text-left">
                        <h4 className="text-xl font-black text-slate-800 mb-6 border-b-2 border-red-900 pb-2 inline-block">
                            Quick Links
                        </h4>

                        <ul className="space-y-4">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-slate-600 hover:text-red-900 font-bold flex items-center gap-2 transition-colors justify-center md:justify-start"
                                >
                                    <span className="text-red-900/40">›</span> About Us
                                </Link>
                            </li>

                            {[
                                { name: "Contact Us", href: "/#contact" },
                                { name: "Admissions", href: "/admission" },
                                { name: "Our Campuses", href: "/#facilities" }
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-slate-600 hover:text-red-900 font-bold flex items-center gap-2 transition-colors justify-center md:justify-start"
                                    >
                                        <span className="text-red-900/40">›</span> {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="text-center md:text-left">
                        <h4 className="text-xl font-black text-slate-800 mb-6 border-b-2 border-red-900 pb-2 inline-block">
                            E-School
                        </h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/portal/student/check" className="text-slate-600 hover:text-red-900 font-bold flex items-center gap-2 transition-colors justify-center md:justify-start">
                                    <span className="text-red-900/40">›</span> E-Learning
                                </Link>
                            </li>
                            <li>
                                <Link href="/portal/student/check" className="text-slate-600 hover:text-red-900 font-bold flex items-center gap-2 transition-colors justify-center md:justify-start">
                                    <span className="text-red-900/40">›</span> Check Result
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="text-slate-600 hover:text-red-900 font-bold flex items-center gap-2 transition-colors justify-center md:justify-start">
                                    <span className="text-red-900/40">›</span> Portal Login
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="text-slate-600 hover:text-red-900 font-bold flex items-center gap-2 transition-colors justify-center md:justify-start">
                                    <span className="text-red-900/40">›</span> Parents Login
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className="text-center md:text-left">
                        <h4 className="text-xl font-black text-slate-800 mb-6 border-b-2 border-red-900 pb-2 inline-block">
                            Get In Touch
                        </h4>
                        <p className="text-slate-500 mb-6 text-sm font-medium">
                            Join our newsletter for school updates and announcements.
                        </p>
                        <form onSubmit={handleNewsletter} className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter Email Address"
                                className="w-full p-4 pr-16 rounded-xl bg-white border border-slate-200 shadow-sm outline-none focus:ring-2 focus:ring-red-900 font-medium text-slate-900"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="absolute right-2 top-2 bg-red-900 p-2 rounded-lg text-white hover:bg-red-800 transition-colors disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} />}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="flex justify-center mb-10">
                    <button
                        onClick={scrollToTop}
                        className="bg-red-900 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-800 transition-all active:scale-95"
                    >
                        <ArrowUp size={24} />
                    </button>
                </div>
            </div>
        </footer>
    );
}
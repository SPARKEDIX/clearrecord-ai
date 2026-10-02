import { Lexend } from "next/font/google";
import type { Metadata } from "next";
import Script from "next/script";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import { AuthProvider } from "@/lib/auth/AuthContext";
import "@/styles/globals.css";

const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend" });

export const metadata: Metadata = {
  title: {
    default: "ClearRecord AI",
    template: "%s · ClearRecord AI"
  },
  description:
    "Audit your social media before employers do. AI risk scan, Digital Hygiene Score and shareable report."
};

// Runs before hydration so the saved/system theme applies with no flash.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("clearrecord-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}if(t==="light"){document.documentElement.classList.add("light");}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={lexend.variable} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background font-lexend text-white antialiased">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <ThemeProvider>
          <AuthProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


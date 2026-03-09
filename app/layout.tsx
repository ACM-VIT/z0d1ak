import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "z0d1ak",
  description: "CTF Writeups and Hacking Adventures",
  icons: {
    icon: "/favicon.png",
  },
  alternates: {
    canonical: "https://z0d1ak.vercel.app",
  },
  openGraph: {
    title: "z0d1ak",
    description: "CTF Writeups and Hacking Adventures",
    url: "https://z0d1ak.vercel.app",
    siteName: "z0d1ak",
    images: [
      {
        url: "https://z0d1ak.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "z0d1ak Open Graph Image",
      },
    ],
    locale: "en_US",
    type: "website",
    // },
    // twitter: {
    //   card: "summary_large_image",
    //   title: "z0d1ak",
    //   description: "CTF Writeups and Hacking Adventures",
    //   images: ["https://z0d1ak.com/twitter-image.png"],
    //   creator: "@yourtwitterhandle",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-black text-green-500`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
        >
          <ToastProvider>
            {children}
            <ToastViewport />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

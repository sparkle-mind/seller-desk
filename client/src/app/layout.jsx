import "./globals.css";
import { Alegreya, Instrument_Sans } from "next/font/google";
import ThemeRegistry from "@/theme/ThemeRegistry";
import ReduxProvider from "@/store/ReduxProvider";
import AppLayout from "@/components/layout/AppLayout";
import ToastProvider from "@/components/common/ToastProvider";
import QueryProvider from "@/providers/QueryProvider";

export const metadata = {
  title: "SellerDesk | E-commerce Business Management Dashboard",
  description: "Centralized multi-channel operations platform for Meesho & Flipkart sellers.",
};

// App typefaces ("Lapels" design language), used in every mode: light, dark
// and system. Exposed as CSS variables and referenced by --font-sans /
// --font-display in globals.css.
const displayFont = Alegreya({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-alegreya",
  display: "swap",
});

const bodyFont = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const themeBootstrap = `(function(){try{var raw=localStorage.getItem("seller_desk_theme");var t=raw?JSON.parse(raw):{};var m=t.mode||"system";var dark=m==="dark"||(m==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",dark);r.style.colorScheme=dark?"dark":"light";r.dataset.theme=dark?"dark":"light";if(t.palette)r.dataset.palette=t.palette;}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable}`}
      suppressHydrationWarning
    >
      <body id="__next-root">
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <ReduxProvider>
          <QueryProvider>
            <ThemeRegistry>
              <ToastProvider>
                <AppLayout>{children}</AppLayout>
              </ToastProvider>
            </ThemeRegistry>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

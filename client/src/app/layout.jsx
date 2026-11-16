import "./globals.css";
import ThemeRegistry from "@/theme/ThemeRegistry";
import ReduxProvider from "@/store/ReduxProvider";
import AppLayout from "@/components/layout/AppLayout";

export const metadata = {
  title: "SellerDesk | E-commerce Business Management Dashboard",
  description: "Centralized multi-channel operations platform for Meesho & Flipkart sellers.",
};

const themeBootstrap = `(function(){try{var raw=localStorage.getItem("seller_desk_theme");var t=raw?JSON.parse(raw):{};var m=t.mode||"system";var dark=m==="dark"||(m==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",dark);r.style.colorScheme=dark?"dark":"light";r.dataset.theme=dark?"dark":"light";if(t.palette)r.dataset.palette=t.palette;}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body id="__next-root">
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <ReduxProvider>
          <ThemeRegistry>
            <AppLayout>{children}</AppLayout>
          </ThemeRegistry>
        </ReduxProvider>
      </body>
    </html>
  );
}

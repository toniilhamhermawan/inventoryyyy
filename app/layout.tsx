
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Smart Inventory",
    template: "%s | Smart Inventory",
  },
  description:
    "Kelola stok, produk, dan pergerakan barang usaha Anda dalam satu tempat.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){function clean(n){if(!n||n.nodeType!==1||!n.attributes)return;for(var i=n.attributes.length-1;i>=0;i--){var name=n.attributes[i].name;if(name.indexOf('bis_')===0||name.indexOf('__processed_')===0){n.removeAttribute(name);}}}function walk(r){clean(r);var els=r.querySelectorAll?r.querySelectorAll('*'):[];for(var j=0;j<els.length;j++)clean(els[j]);}walk(document);new MutationObserver(function(ms){for(var k=0;k<ms.length;k++){var m=ms[k];if(m.type==='attributes'){clean(m.target);}if(m.addedNodes){for(var x=0;x<m.addedNodes.length;x++){var n=m.addedNodes[x];if(n.nodeType===1)walk(n);}}}}).observe(document.documentElement,{subtree:true,childList:true,attributes:true});})();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col bg-[#F4F7FA] text-[#293746]"
      >
        {children}
      </body>
    </html>
  );
}

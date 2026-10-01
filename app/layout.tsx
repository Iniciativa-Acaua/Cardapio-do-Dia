import type { Metadata } from "next";
import "./globals.css";
import  Header  from "@/components/layout/Header";
import  Footer  from "@/components/layout/footer";


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-br"
    >
      <body className="bg-neutral-950 text-white antialiased">
        <Header/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}

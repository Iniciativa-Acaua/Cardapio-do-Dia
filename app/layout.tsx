import type { Metadata } from "next";
import "./globals.css";
import  Header  from "@/components/layout/Header";
import  Footer  from "@/components/layout/footer";


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-br"
    >
      <body >
        <Header/>

        {children}

        <Footer/>
      </body>
    </html>
  );
}

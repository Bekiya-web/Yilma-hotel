import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppFab from "./WhatsAppFab";

const SiteLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
    <WhatsAppFab />
  </div>
);

export default SiteLayout;
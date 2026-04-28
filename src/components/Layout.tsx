import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="relative min-h-screen flex flex-col">
    <Header />
    <main className="relative z-10 flex-1">{children}</main>
    <Footer />
  </div>
);

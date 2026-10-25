import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Hero } from "@/components/home/Hero";
import { StatsBar } from "@/components/home/StatsBar";
import { Services } from "@/components/home/Services";
import { About } from "@/components/home/About";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Faq } from "@/components/home/Faq";
import { ContactSection } from "@/components/home/ContactSection";

export default function Home() {
  return (
    <>
      <TopBar />
      <Header />
      <main className="flex-1">
        <Hero />
        <StatsBar />
        <Services />
        <About />
        <HowItWorks />
        <Faq />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

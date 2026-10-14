import { Faq } from "@/components/landing/faq/Faq";
import Features from "@/components/landing/features/Features";
import FinalCta from "@/components/landing/finalCta/FinalCta";
import Footer from "@/components/landing/footer/Footer";
import FounderStory from "@/components/landing/founderStory/FounderStory";
import Hero from "@/components/landing/hero/Hero";
import Navbar from "@/components/landing/navbar/Navbar";
import Workflow from "@/components/landing/workflow/Workflow";

export default function Home() {
    return (
        <div className="grid h-svh overflow-y-auto scroll-smooth">
            <Navbar />
            <main id="main">
                <Hero />
                <Features />
                <Workflow />
                <FounderStory />
                <Faq />
                <FinalCta />
            </main>
            <Footer />
        </div>
    );
}

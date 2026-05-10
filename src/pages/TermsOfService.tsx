import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import Seo from "@/components/Seo";

const TermsOfService = () => {
  return (
    <main className="min-h-screen bg-[#F3F4ED] text-[#111]">
      <Seo
        title="Terms of Service | NexoMind"
        description="NexoMind terms of service: usage rules, subscription terms, and important disclaimers for using the AI journaling app."
      />
      <Navbar />

      <section className="px-6 pt-40 pb-12 max-w-3xl mx-auto">
        <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-6">
          ( Terms of Service )
        </p>
        <h1 className="font-instrument text-[44px] md:text-[72px] leading-[1] tracking-tight">
          The <span className="italic">simple version.</span>
        </h1>
        <p className="font-barlow text-[15px] text-[#111]/55 mt-6">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      </section>

      <article className="px-6 pb-24 max-w-3xl mx-auto space-y-10 font-barlow text-[16px] leading-relaxed text-[#111]/75">
        <section>
          <h2 className="font-instrument text-[28px] md:text-[34px] text-[#111] mb-3">Usage rules</h2>
          <p>NexoMind is intended for personal reflection. Don't use the service to harass, harm, or impersonate others, or to submit content that is illegal. Don't attempt to reverse-engineer the service or use it to build a competing product.</p>
        </section>

        <section>
          <h2 className="font-instrument text-[28px] md:text-[34px] text-[#111] mb-3">Subscription terms</h2>
          <p>NexoMind offers a free tier with 3 reflections per rolling 7-day window. NexoMind Premium is billed at $9.99 per month or $95 per year and renews automatically until cancelled. You can cancel any time from your account settings — your subscription remains active through the end of the current billing period. Refunds are handled on a case-by-case basis within 14 days of purchase. Taxes (VAT, GST, sales tax) are calculated and collected at checkout where applicable.</p>
        </section>

        <section>
          <h2 className="font-instrument text-[28px] md:text-[34px] text-[#111] mb-3">Liability disclaimer</h2>
          <p>NexoMind is a reflection tool, not a medical, psychological, or therapeutic service. It is not a substitute for professional mental health care. If you are in crisis or experiencing a medical emergency, please contact a qualified professional or emergency services.</p>
          <p className="mt-4">The service is provided "as is." To the maximum extent permitted by law, we disclaim all warranties and are not liable for indirect, incidental, or consequential damages arising from your use of the product.</p>
        </section>

        <section>
          <h2 className="font-instrument text-[28px] md:text-[34px] text-[#111] mb-3">Changes to these terms</h2>
          <p>We may update these terms from time to time. We'll post any changes on this page and update the date above. Continued use of the service after changes means you accept the updated terms.</p>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
};

export default TermsOfService;

import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import Seo from "@/components/Seo";

const PrivacyPolicy = () => {
  return (
    <main className="min-h-screen bg-[#F3F4ED] text-[#111]">
      <Seo
        title="Privacy Policy | NexoMind"
        description="NexoMind's privacy policy: we never sell your data, your reflections are encrypted, and AI processing is fully transparent."
      />
      <Navbar />

      <section className="px-6 pt-40 pb-12 max-w-3xl mx-auto">
        <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-6">
          ( Privacy Policy )
        </p>
        <h1 className="font-instrument text-[44px] md:text-[72px] leading-[1] tracking-tight">
          Your thoughts <span className="italic">stay yours.</span>
        </h1>
        <p className="font-barlow text-[15px] text-[#111]/55 mt-6">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      </section>

      <article className="px-6 pb-24 max-w-3xl mx-auto space-y-10 font-barlow text-[16px] leading-relaxed text-[#111]/75">
        <section>
          <h2 className="font-instrument text-[28px] md:text-[34px] text-[#111] mb-3">No data selling</h2>
          <p>We do not sell, rent, or share your personal data or your reflections with advertisers, data brokers, or third parties for marketing purposes. Ever.</p>
        </section>

        <section>
          <h2 className="font-instrument text-[28px] md:text-[34px] text-[#111] mb-3">Secure journaling</h2>
          <p>Your journal entries are encrypted in transit and at rest. Authentication is handled by industry-standard providers, and only you can read your entries when signed in to your account.</p>
        </section>

        <section>
          <h2 className="font-instrument text-[28px] md:text-[34px] text-[#111] mb-3">AI processing transparency</h2>
          <p>When you submit an entry, the text is sent to our AI model to generate a summary, emotional state, and reflection. Entries are not used to train public AI models. We retain entries only so you can revisit them in your dashboard, and you can delete them at any time.</p>
        </section>

        <section>
          <h2 className="font-instrument text-[28px] md:text-[34px] text-[#111] mb-3">What we collect</h2>
          <p>Account information (email, display name), your journal entries, and basic usage analytics to keep the product running smoothly. We do not track you across other websites.</p>
        </section>

        <section>
          <h2 className="font-instrument text-[28px] md:text-[34px] text-[#111] mb-3">Your rights</h2>
          <p>You can request a copy of your data, export your entries, or permanently delete your account at any time by writing to <a href="mailto:hello@nexomind.app" className="underline underline-offset-4">hello@nexomind.app</a>.</p>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
};

export default PrivacyPolicy;

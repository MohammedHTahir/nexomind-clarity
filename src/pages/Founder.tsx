import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import Seo from "@/components/Seo";
import { Link } from "react-router-dom";

const Founder = () => {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "The NexoMind Founder",
      url: "https://www.nexomind.ai/founder",
      jobTitle: "Founder",
      worksFor: { "@type": "Organization", name: "NexoMind", url: "https://www.nexomind.ai" },
      sameAs: [
        "https://twitter.com/nexomind",
        "https://www.linkedin.com/company/nexomind",
        "https://github.com/nexomind",
      ],
      knowsAbout: [
        "AI journaling",
        "Mental clarity",
        "Overthinking",
        "Private reflection",
        "Thought processing",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "Founder of NexoMind",
      url: "https://www.nexomind.ai/founder",
      about: { "@type": "Organization", name: "NexoMind" },
    },
  ];

  return (
    <main className="min-h-screen bg-[#F3F4ED] text-[#111]">
      <Seo
        title="Founder of NexoMind — Why we built private AI journaling"
        description="Meet the founder behind NexoMind, the private AI journaling platform built to help quiet, overthinking minds find mental clarity in seconds."
        canonical="https://www.nexomind.ai/founder"
        jsonLd={jsonLd}
        type="profile"
      />
      <Navbar />

      <section className="px-6 pt-40 pb-12 max-w-3xl mx-auto">
        <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-6">
          ( Founder )
        </p>
        <h1 className="font-instrument text-[44px] md:text-[80px] leading-[1] tracking-tight">
          The mind behind <span className="italic">NexoMind.</span>
        </h1>
        <p className="font-barlow text-[18px] leading-relaxed text-[#111]/70 mt-8">
          NexoMind was built by an engineer who spent too many nights stuck in their own head — and
          decided to design a way out.
        </p>
      </section>

      <article className="px-6 pb-24 max-w-3xl mx-auto space-y-10 font-barlow text-[17px] leading-relaxed text-[#111]/75">
        <section>
          <h2 className="font-instrument text-[32px] md:text-[40px] leading-tight text-[#111] mb-4">
            Why I built NexoMind
          </h2>
          <p>
            I'm a software engineer with a background in product design and applied AI. For years
            I'd close the laptop and immediately start replaying conversations, second-guessing
            decisions, and losing sleep to thoughts that had nowhere to go.
          </p>
          <p className="mt-4">
            Therapy and journaling helped, but they asked for energy I didn't always have at 1am.
            What I needed was something quieter — a place to dump the loop, have it read back to me
            with shape, and walk away with one less thing rattling around.
          </p>
          <p className="mt-4">
            NexoMind is that tool. It's the private AI journal I wish existed: built specifically
            for stopping overthinking and surfacing mental clarity, not for streaks or productivity.
          </p>
        </section>

        <section>
          <h2 className="font-instrument text-[32px] md:text-[40px] leading-tight text-[#111] mb-4">
            What NexoMind is — and isn't
          </h2>
          <p>
            NexoMind is a <strong>private AI journaling platform</strong> for mental clarity,
            thought processing, and reducing overthinking. It is not a productivity tool, a chatbot,
            or a mood tracker that grades your week.
          </p>
          <p className="mt-4">
            Every reflection stays private. Your entries are encrypted, never sold, and never used
            to train public models.
          </p>
        </section>

        <section>
          <h2 className="font-instrument text-[32px] md:text-[40px] leading-tight text-[#111] mb-4">
            Connect
          </h2>
          <ul className="space-y-2">
            <li>
              <a
                href="https://twitter.com/nexomind"
                rel="me noopener"
                target="_blank"
                className="underline underline-offset-4 hover:text-[#111]"
              >
                X / Twitter
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/company/nexomind"
                rel="me noopener"
                target="_blank"
                className="underline underline-offset-4 hover:text-[#111]"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://github.com/nexomind"
                rel="me noopener"
                target="_blank"
                className="underline underline-offset-4 hover:text-[#111]"
              >
                GitHub
              </a>
            </li>
          </ul>
        </section>

        <div className="pt-6">
          <Link
            to="/auth"
            className="inline-block bg-[#111] text-white rounded-full px-8 py-4 font-barlow font-medium text-[15px] hover:bg-black transition-all"
          >
            Start your first reflection
          </Link>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
};

export default Founder;

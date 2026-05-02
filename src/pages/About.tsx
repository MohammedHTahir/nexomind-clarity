import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import Seo from "@/components/Seo";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <main className="min-h-screen bg-[#F3F4ED] text-[#111]">
      <Seo
        title="About NexoMind — Why we built it | NexoMind"
        description="The story behind NexoMind: a private AI journaling app built to help quiet, overthinking minds find clarity in seconds."
      />
      <Navbar />

      <section className="px-6 pt-40 pb-16 max-w-3xl mx-auto">
        <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-6">
          ( About )
        </p>
        <h1 className="font-instrument text-[44px] md:text-[80px] leading-[1] tracking-tight">
          Built for the <span className="italic">quiet, busy mind.</span>
        </h1>
        <p className="font-barlow text-[18px] leading-relaxed text-[#111]/70 mt-8">
          NexoMind started the way most useful things do — out of necessity.
        </p>
      </section>

      <article className="px-6 pb-24 max-w-3xl mx-auto space-y-10 font-barlow text-[17px] leading-relaxed text-[#111]/75">
        <section>
          <h2 className="font-instrument text-[32px] md:text-[40px] leading-tight text-[#111] mb-4">
            The founder story
          </h2>
          <p>
            For years, I'd lie awake replaying conversations, decisions, and small moments that wouldn't let go. Therapy helped. Journaling helped. But both asked for time and energy I didn't always have at 1am.
          </p>
          <p className="mt-4">
            What I needed was something quieter. Something that could read what I wrote, name the feeling underneath, and hand the thought back to me with a little more shape. So I built it.
          </p>
        </section>

        <section>
          <h2 className="font-instrument text-[32px] md:text-[40px] leading-tight text-[#111] mb-4">
            Why NexoMind exists
          </h2>
          <p>
            Most journaling apps ask you to perform — track moods, build streaks, keep up. NexoMind doesn't. It's built for the moments when you don't have a plan, just a thought you can't shake.
          </p>
          <p className="mt-4">
            We believe clarity should take seconds, not sessions. And reflection should feel private, not performative.
          </p>
        </section>

        <section>
          <h2 className="font-instrument text-[32px] md:text-[40px] leading-tight text-[#111] mb-4">
            What we believe
          </h2>
          <p>
            Your thoughts belong to you. We don't sell data. We don't train public models on your reflections. We use AI quietly — only to help you understand what's already inside what you wrote.
          </p>
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

export default About;

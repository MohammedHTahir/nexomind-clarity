import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import Seo from "@/components/Seo";
import { allPosts } from "@/lib/blog";

const SITE_URL = "https://www.nexomind.ai";

const Blog = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "NexoMind Journal",
    url: `${SITE_URL}/blog`,
    description:
      "Calm, practical writing on overthinking, mental clarity, and AI-assisted reflection.",
    blogPost: allPosts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      url: `${SITE_URL}/blog/${p.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-[#F3F4ED]">
      <Seo
        title="Journal — NexoMind"
        description="Calm, practical writing on overthinking, mental clarity, and AI-assisted reflection."
        canonical={`${SITE_URL}/blog`}
        jsonLd={jsonLd}
        type="website"
      />
      <Navbar />
      <section className="px-6 pt-32 pb-20 max-w-4xl mx-auto">
        <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-4">
          ( Journal )
        </p>
        <h1 className="font-instrument text-[48px] md:text-[72px] leading-[1] tracking-tight text-[#111]">
          Notes on <span className="italic">clarity.</span>
        </h1>
        <p className="font-barlow text-[17px] leading-relaxed text-[#111]/65 mt-6 max-w-2xl">
          Short, calm reads on overthinking, reflection, and the small shifts that change how you think.
        </p>

        <div className="mt-16 space-y-10">
          {allPosts.map((p) => (
            <article key={p.slug} className="border-b border-black/10 pb-10 last:border-none">
              <Link to={`/blog/${p.slug}`} className="group block">
                <p className="font-barlow text-[12px] tracking-[0.18em] uppercase text-[#111]/50 mb-3">
                  {new Date(p.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <h2 className="font-instrument text-[30px] md:text-[40px] leading-tight text-[#111] group-hover:underline decoration-1 underline-offset-4">
                  {p.title}
                </h2>
                <p className="font-barlow text-[16px] text-[#111]/65 leading-relaxed mt-4 max-w-2xl">
                  {p.excerpt || p.description}
                </p>
                <span className="inline-block font-barlow text-[13px] text-[#111]/70 tracking-wide mt-5 group-hover:text-[#111] transition-colors">
                  Read →
                </span>
              </Link>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
};

export default Blog;

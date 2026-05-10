import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import Seo from "@/components/Seo";
import NotFound from "@/pages/NotFound";
import { allPosts, getPost, renderMarkdown } from "@/lib/blog";

const SITE_URL = "https://www.nexomind.ai";

const BlogPost = () => {
  const { slug } = useParams();
  const post = slug ? getPost(slug) : undefined;
  const html = useMemo(() => (post ? renderMarkdown(post.body) : ""), [post]);

  if (!post) return <NotFound />;

  const url = `${SITE_URL}/blog/${post.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
      mainEntityOfPage: url,
      url,
      author: { "@type": "Organization", name: "NexoMind" },
      publisher: {
        "@type": "Organization",
        name: "NexoMind",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.jpg` },
      },
      keywords: post.tags.join(", "),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Journal", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <main className="min-h-screen bg-[#F3F4ED]">
      <Seo
        title={`${post.title} — NexoMind`}
        description={post.description}
        canonical={url}
        jsonLd={jsonLd}
        type="article"
      />
      <Navbar />
      <article className="px-6 pt-32 pb-20 max-w-3xl mx-auto">
        <nav aria-label="Breadcrumb" className="font-barlow text-[13px] text-[#111]/55 mb-8">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-2">›</span>
          <Link to="/blog" className="hover:underline">Journal</Link>
        </nav>
        <p className="font-barlow text-[12px] tracking-[0.18em] uppercase text-[#111]/50 mb-4">
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="font-instrument text-[40px] md:text-[60px] leading-[1.05] tracking-tight text-[#111]">
          {post.title}
        </h1>
        <p className="font-barlow text-[18px] leading-relaxed text-[#111]/70 mt-6">
          {post.description}
        </p>

        <div
          className="prose prose-lg max-w-none mt-12 font-barlow text-[#111]/85
            prose-headings:font-instrument prose-headings:text-[#111] prose-headings:font-normal
            prose-h2:text-[30px] prose-h2:mt-12 prose-h2:mb-4 prose-h2:leading-tight
            prose-p:leading-relaxed prose-p:text-[17px]
            prose-a:text-[#111] prose-a:underline prose-a:underline-offset-4
            prose-strong:text-[#111] prose-strong:font-semibold
            prose-ol:font-barlow prose-ul:font-barlow"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {related.length > 0 && (
          <aside className="mt-20 border-t border-black/10 pt-10">
            <h2 className="font-instrument text-[26px] text-[#111] mb-6">Continue reading</h2>
            <ul className="space-y-4">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to={`/blog/${r.slug}`}
                    className="font-barlow text-[16px] text-[#111]/85 hover:underline"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </article>
      <SiteFooter />
    </main>
  );
};

export default BlogPost;

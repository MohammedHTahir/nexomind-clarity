import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { allPosts } from "@/lib/blog";

const ease = [0.16, 1, 0.3, 1] as const;

const BlogPreview = () => {
  const posts = allPosts.slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section className="bg-[#F3F4ED] py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-4">
              ( Journal )
            </p>
            <h2 className="font-instrument text-[44px] md:text-[64px] leading-[1] tracking-tight text-[#111]">
              Notes on <span className="italic">clarity.</span>
            </h2>
            <p className="font-barlow text-[17px] leading-relaxed text-[#111]/65 mt-6">
              Short, calm reads on overthinking, reflection, and the small shifts that change how you think.
            </p>
          </div>
          <Link
            to="/blog"
            className="font-barlow text-[14px] tracking-wide text-[#111]/70 hover:text-[#111] underline underline-offset-4"
          >
            Read all →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {posts.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease }}
            >
              <Link
                to={`/blog/${p.slug}`}
                className="group block bg-white rounded-[22px] p-7 border border-black/5 hover:border-black/15 transition-all h-full"
              >
                <p className="font-barlow text-[11px] tracking-[0.18em] uppercase text-[#111]/45 mb-3">
                  {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <h3 className="font-instrument text-[26px] leading-tight text-[#111] mb-3">
                  {p.title}
                </h3>
                <p className="font-barlow text-[15px] text-[#111]/60 leading-relaxed mb-6">
                  {p.excerpt || p.description}
                </p>
                <span className="font-barlow text-[13px] text-[#111]/70 tracking-wide group-hover:text-[#111] transition-colors">
                  Read →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;

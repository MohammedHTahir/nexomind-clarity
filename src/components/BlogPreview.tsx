import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const posts = [
  {
    to: "/how-to-stop-overthinking",
    title: "How to stop overthinking",
    desc: "A calm, practical approach to interrupting the loop without forcing it.",
  },
  {
    to: "/mental-clarity",
    title: "What mental clarity really means",
    desc: "Clarity isn't an empty mind. It's the moment your thoughts make sense.",
  },
  {
    to: "/ai-journaling",
    title: "AI journaling, explained",
    desc: "How AI reflection turns messy thoughts into structured insight.",
  },
  {
    to: "/overthinking-at-night",
    title: "Why overthinking gets louder at night",
    desc: "When the day goes quiet, unprocessed thoughts get louder. Here's why.",
  },
  {
    to: "/why-do-i-overthink",
    title: "Why do I overthink?",
    desc: "Recurring loops are a signal — not a flaw. Learn what they're asking for.",
  },
];

const BlogPreview = () => {
  return (
    <section className="bg-[#F3F4ED] py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14 max-w-2xl">
          <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-4">
            ( Reading )
          </p>
          <h2 className="font-instrument text-[44px] md:text-[64px] leading-[1] tracking-tight text-[#111]">
            Explore <span className="italic">mental clarity.</span>
          </h2>
          <p className="font-barlow text-[17px] leading-relaxed text-[#111]/65 mt-6">
            Short, calm reads on overthinking, reflection, and the small shifts that change how you think.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {posts.slice(0, 3).map((p, i) => (
            <motion.div
              key={p.to}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease }}
            >
              <Link
                to={p.to}
                className="group block bg-white rounded-[22px] p-7 border border-black/5 hover:border-black/15 transition-all h-full"
              >
                <h3 className="font-instrument text-[26px] leading-tight text-[#111] mb-3">
                  {p.title}
                </h3>
                <p className="font-barlow text-[15px] text-[#111]/60 leading-relaxed mb-6">
                  {p.desc}
                </p>
                <span className="font-barlow text-[13px] text-[#111]/70 tracking-wide group-hover:text-[#111] transition-colors">
                  Read more →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-5">
          {posts.slice(3).map((p, i) => (
            <motion.div
              key={p.to}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease }}
            >
              <Link
                to={p.to}
                className="group block bg-white rounded-[22px] p-7 border border-black/5 hover:border-black/15 transition-all h-full"
              >
                <h3 className="font-instrument text-[24px] leading-tight text-[#111] mb-2">
                  {p.title}
                </h3>
                <p className="font-barlow text-[15px] text-[#111]/60 leading-relaxed">
                  {p.desc}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;

import { motion } from "framer-motion";

const steps = [
  { n: "01", t: "Write freely", d: "Open NexoMind and type whatever's on your mind. No prompts, no judgment." },
  { n: "02", t: "Listen back", d: "Our AI gently reflects patterns, emotions and themes from what you wrote." },
  { n: "03", t: "Find clarity", d: "End each session with a calmer mind and one small, honest insight." },
];

const About = () => {
  return (
    <section className="bg-[#F3F4ED] py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-12 gap-12 items-end mb-20">
          <div className="md:col-span-5">
            <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-4">
              ( About )
            </p>
            <h2 className="font-instrument text-[44px] md:text-[64px] leading-[1] text-[#111]">
              A quiet place <br /> for a loud <span className="italic">mind.</span>
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <p className="font-barlow text-[17px] leading-relaxed text-[#111]/70">
              NexoMind is a private journaling companion built for the moments
              between meetings, late nights and racing thoughts. We don't sell
              your data, push notifications or score your mood — we just listen.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-[20px] p-8 border border-black/5"
            >
              <div className="font-barlow font-medium text-[13px] text-[#111]/40 mb-10">
                {s.n}
              </div>
              <h3 className="font-instrument text-[28px] leading-tight text-[#111] mb-3">
                {s.t}
              </h3>
              <p className="font-barlow text-[15px] text-[#111]/60 leading-relaxed">
                {s.d}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;

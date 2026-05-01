import { motion } from "framer-motion";

const steps = [
  { n: "01", t: "Recognize patterns you've been repeating", d: "See the loops you didn't notice you were in." },
  { n: "02", t: "Understand emotional triggers", d: "Catch what sets you off — before it takes over." },
  { n: "03", t: "Turn mental noise into clarity", d: "Messy thoughts, structured into something you can see." },
];

const About = () => {
  return (
    <section className="bg-[#F3F4ED] py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-12 gap-12 items-end mb-20">
          <div className="md:col-span-5">
            <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-4">
              ( The problem )
            </p>
            <h2 className="font-instrument text-[44px] md:text-[64px] leading-[1] text-[#111]">
              You're not thinking too much. <br /> You're thinking <span className="italic">without clarity.</span>
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <p className="font-barlow text-[17px] leading-relaxed text-[#111]/70">
              The same thoughts loop. At night. In silence. When nothing distracts you.
              You try to make sense of them… but they just get louder.
              <br /><br />
              <span className="italic text-[#111]/55">This isn't overthinking. It's unprocessed thinking.</span>
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

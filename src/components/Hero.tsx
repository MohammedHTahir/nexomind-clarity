import { motion } from "framer-motion";
import { Play } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden flex items-center justify-center">
      {/* Video bg */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
          type="video/mp4"
        />
      </video>

      {/* Hero content */}
      <div className="relative z-10 text-center px-6 pt-32 pb-16 max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease }}
          className="text-white"
        >
          <span className="block font-barlow font-medium text-[44px] md:text-[72px] lg:text-[84px] leading-[0.95] tracking-[-2px] md:tracking-[-4px]">
            A space that quiets your
          </span>
          <span className="block font-instrument italic text-[52px] md:text-[78px] lg:text-[100px] leading-[1] mt-2">
            mind &amp; brings clarity
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease }}
          className="font-barlow font-medium text-[16px] md:text-[18px] text-white/85 mt-8 max-w-xl mx-auto"
        >
          Private AI journaling for thinkers, creators and anyone navigating the noise of modern life.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.45, ease }}
          className="mt-10 flex justify-center"
        >
          <button
            type="button"
            className="group flex items-center gap-3 bg-white text-[#111] rounded-full pl-2 pr-7 py-2 font-barlow font-medium text-[15px] hover:bg-white/90 transition-colors"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#111] text-white">
              <Play className="w-4 h-4 fill-white" strokeWidth={0} />
            </span>
            See Our Workreel
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

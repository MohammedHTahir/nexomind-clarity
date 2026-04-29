import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

type Props = HTMLMotionProps<"div"> & { delay?: number };

const GlassCard = forwardRef<HTMLDivElement, Props>(
  ({ className, delay = 0, children, ...rest }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, delay, ease }}
        className={cn(
          "bg-white/70 backdrop-blur-md rounded-[20px] border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]",
          className
        )}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }
);
GlassCard.displayName = "GlassCard";

export default GlassCard;

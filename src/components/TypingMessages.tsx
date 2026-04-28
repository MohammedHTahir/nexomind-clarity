import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const messages = [
  "I feel overwhelmed today.",
  "That makes sense. Let's break it down.",
  "It looks like stress and mental overload. Want clarity on it?",
];

const TYPING_SPEED = 100;
const DELETING_SPEED = 50;
const PAUSE = 2000;

const TypingMessages = () => {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = messages[index];

    if (!deleting && text === current) {
      const t = setTimeout(() => setDeleting(true), PAUSE);
      return () => clearTimeout(t);
    }

    if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % messages.length);
      return;
    }

    const t = setTimeout(
      () => {
        setText((prev) =>
          deleting ? current.slice(0, prev.length - 1) : current.slice(0, prev.length + 1)
        );
      },
      deleting ? DELETING_SPEED : TYPING_SPEED
    );

    return () => clearTimeout(t);
  }, [text, deleting, index]);

  return (
    <div
      className="absolute left-[48.5%] md:left-[47.5%] lg:left-[48.5%] -translate-x-1/2 bottom-[32%] z-30 w-[110px] sm:w-[130px] flex justify-start text-left"
      aria-hidden
    >
      <p className="font-nokia text-[#2A3616] text-[10px] sm:text-[14px] leading-tight break-words min-h-[1.5em]">
        {text}
        <motion.span
          className="inline-block w-1.5 h-3 bg-[#2A3616] ml-1 align-middle"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </p>
    </div>
  );
};

export default TypingMessages;

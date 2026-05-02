import { useState } from "react";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import Seo from "@/components/Seo";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  message: z.string().trim().min(5, "Message is too short").max(2000),
});

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setForm({ name: "", email: "", message: "" });
      toast.success("Thanks — we'll get back to you shortly.");
    }, 600);
  };

  return (
    <main className="min-h-screen bg-[#F3F4ED] text-[#111]">
      <Seo
        title="Contact NexoMind"
        description="Get in touch with the NexoMind team. Questions, feedback, or partnership ideas — we'd love to hear from you."
      />
      <Navbar />

      <section className="px-6 pt-40 pb-12 max-w-3xl mx-auto">
        <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/50 mb-6">
          ( Contact )
        </p>
        <h1 className="font-instrument text-[44px] md:text-[72px] leading-[1] tracking-tight">
          Say <span className="italic">hello.</span>
        </h1>
        <p className="font-barlow text-[17px] leading-relaxed text-[#111]/65 mt-6">
          For support, feedback, or anything else, write to{" "}
          <a href="mailto:hello@nexomind.app" className="underline underline-offset-4 hover:text-[#111]">
            hello@nexomind.app
          </a>{" "}
          — or use the form below.
        </p>
      </section>

      <section className="px-6 pb-24 max-w-2xl mx-auto">
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-[24px] p-7 md:p-9 border border-black/5 space-y-5"
        >
          <div>
            <label className="font-barlow text-[13px] text-[#111]/60 mb-2 block">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full font-barlow text-[15px] bg-transparent border-b border-black/15 focus:border-black/60 outline-none py-2"
              maxLength={100}
            />
          </div>
          <div>
            <label className="font-barlow text-[13px] text-[#111]/60 mb-2 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full font-barlow text-[15px] bg-transparent border-b border-black/15 focus:border-black/60 outline-none py-2"
              maxLength={255}
            />
          </div>
          <div>
            <label className="font-barlow text-[13px] text-[#111]/60 mb-2 block">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              className="w-full font-barlow text-[15px] bg-transparent border-b border-black/15 focus:border-black/60 outline-none py-2 resize-none"
              maxLength={2000}
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="bg-[#111] text-white rounded-full px-7 py-3.5 font-barlow font-medium text-[14px] hover:bg-black transition-all disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send message"}
          </button>
        </form>
      </section>

      <SiteFooter />
    </main>
  );
};

export default Contact;

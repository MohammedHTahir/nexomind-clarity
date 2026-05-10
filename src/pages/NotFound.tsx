import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Seo from "@/components/Seo";

/**
 * NOTE on HTTP status: Lovable's hosting layer serves the SPA fallback
 * (index.html, HTTP 200) for any unknown path, so we cannot return a real
 * 404. Best-effort signals to crawlers below:
 *   - <meta name="robots" content="noindex,nofollow"> (set on mount)
 *   - <meta name="prerender-status-code" content="404"> (respected by some
 *     headless prerendering services)
 * Combined, this prevents stale URL indexing — the closest thing to a
 * proper 404 within the SPA model.
 */
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404: route not found —", location.pathname);

    const set = (name: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
      return el;
    };

    const robots = set("robots", "noindex,nofollow");
    const status = set("prerender-status-code", "404");

    return () => {
      robots.setAttribute("content", "index,follow,max-image-preview:large,max-snippet:-1");
      status.remove();
    };
  }, [location.pathname]);

  return (
    <main className="min-h-screen bg-[#F3F4ED] flex items-center justify-center px-6">
      <Seo
        title="Page not found — NexoMind"
        description="The page you're looking for doesn't exist. Return to NexoMind to keep reflecting."
      />
      <div className="text-center max-w-xl">
        <p className="font-barlow font-medium text-[12px] tracking-[0.2em] uppercase text-[#111]/45 mb-6">
          ( 404 )
        </p>
        <h1 className="font-instrument text-[64px] md:text-[96px] leading-[0.95] tracking-tight text-[#111]">
          This thought <span className="italic">drifted.</span>
        </h1>
        <p className="font-barlow text-[17px] text-[#111]/65 mt-6 leading-relaxed">
          The page you're looking for doesn't exist — or it moved somewhere quieter.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="bg-[#111] text-white rounded-full px-7 py-3.5 font-barlow font-medium text-[14px] hover:bg-black transition-colors"
          >
            Return home
          </Link>
          <Link
            to="/blog"
            className="border border-black/15 text-[#111] rounded-full px-7 py-3.5 font-barlow font-medium text-[14px] hover:bg-black/5 transition-colors"
          >
            Read the journal
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;

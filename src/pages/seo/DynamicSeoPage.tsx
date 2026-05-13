import { useParams } from "react-router-dom";
import SeoPage from "@/components/SeoPage";
import NotFound from "@/pages/NotFound";
import { requiredSeoPages } from "@/pages/seo/requiredSeoPages";
import { seoPages } from "@/pages/seo/seoPages";
import { programmaticSeoPages } from "@/pages/seo/programmatic";
import { targetSeoPages } from "@/pages/seo/targetSeoPages";
import { comparisonSeoPages } from "@/pages/seo/comparisonSeoPages";

// Order matters: comparison + target pages override programmatic ones if slugs collide.
const merged = [...comparisonSeoPages, ...targetSeoPages, ...requiredSeoPages, ...seoPages, ...programmaticSeoPages];
const seen = new Set<string>();
export const allSeoPages = merged.filter((p) => {
  if (seen.has(p.path)) return false;
  seen.add(p.path);
  return true;
});

const DynamicSeoPage = () => {
  const { slug } = useParams();
  const page = allSeoPages.find((item) => item.path === `/${slug}`);

  if (!page) return <NotFound />;

  return <SeoPage config={page} />;
};

export default DynamicSeoPage;
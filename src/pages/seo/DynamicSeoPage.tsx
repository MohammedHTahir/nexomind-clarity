import { useParams } from "react-router-dom";
import SeoPage from "@/components/SeoPage";
import NotFound from "@/pages/NotFound";
import { requiredSeoPages } from "@/pages/seo/requiredSeoPages";
import { seoPages } from "@/pages/seo/seoPages";
import { programmaticSeoPages } from "@/pages/seo/programmatic";

export const allSeoPages = [...requiredSeoPages, ...seoPages, ...programmaticSeoPages];

const DynamicSeoPage = () => {
  const { slug } = useParams();
  const page = allSeoPages.find((item) => item.path === `/${slug}`);

  if (!page) return <NotFound />;

  return <SeoPage config={page} />;
};

export default DynamicSeoPage;
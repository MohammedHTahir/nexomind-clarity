import { useParams } from "react-router-dom";
import SeoPage from "@/components/SeoPage";
import NotFound from "@/pages/NotFound";
import { programmaticSeoPages } from "@/pages/seo/programmatic";

const map = new Map(programmaticSeoPages.map((p) => [p.path, p]));

const ProgrammaticSeoRoute = () => {
  const { slug } = useParams();
  const config = slug ? map.get(`/${slug}`) : undefined;
  if (!config) return <NotFound />;
  return <SeoPage config={config} />;
};

export default ProgrammaticSeoRoute;

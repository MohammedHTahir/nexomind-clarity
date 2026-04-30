import Seo from "@/components/Seo";
import SeoLayout from "@/components/SeoLayout";

type Section = { h2: string; body: string };
type Related = { to: string; label: string; desc: string };

export interface SeoPageConfig {
  path: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  italic: string;
  intro: string;
  sections: Section[];
  related: Related[];
}

const SeoPage = ({ config }: { config: SeoPageConfig }) => {
  return (
    <>
      <Seo title={config.metaTitle} description={config.metaDescription} />
      <SeoLayout
        eyebrow={config.eyebrow}
        title={config.title}
        italic={config.italic}
        intro={config.intro}
        related={config.related}
      >
        <div className="space-y-10 font-barlow text-[17px] leading-relaxed text-[#111]/75">
          {config.sections.map((s) => (
            <section key={s.h2}>
              <h2 className="font-instrument text-[32px] md:text-[40px] leading-tight text-[#111] mb-4">
                {s.h2}
              </h2>
              <p className="whitespace-pre-line">{s.body}</p>
            </section>
          ))}
        </div>
      </SeoLayout>
    </>
  );
};

export default SeoPage;

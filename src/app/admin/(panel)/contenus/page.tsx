import { HeroEditor, StepsEditor } from "@/components/admin/ContentEditors";
import { PageHeader } from "@/components/admin/ui";
import { getContent } from "@/server/services/admin/content-admin.service";
import { listMedia } from "@/server/services/admin/media.service";

export default async function ContentPage() {
  const [hero, steps, media] = await Promise.all([getContent("home.hero"), getContent("home.steps"), listMedia()]);
  return (
    <>
      <PageHeader
        title="Pages du site"
        subtitle="Les textes des logements, de l’avancement et des coordonnées se modifient dans leurs rubriques respectives."
      />
      <div className="flex max-w-4xl flex-col gap-6 p-5 md:p-10">
        <HeroEditor initial={hero.data} visible={hero.isVisible} media={media} />
        <StepsEditor initial={steps.data} visible={steps.isVisible} />
      </div>
    </>
  );
}

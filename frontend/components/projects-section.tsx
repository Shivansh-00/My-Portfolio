import type { Project } from "@/types/api";

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  const featured = projects.filter((project) => project.featured);
  const others = projects.filter((project) => !project.featured);

  return (
    <section className="section-card">
      <h2 className="section-title">Projects</h2>
      <div className="mt-6 space-y-6">
        <div className="space-y-4">
          {featured.map((project) => (
            <article key={project.id} className="rounded-xl border border-slate-800 p-4">
              <h3 className="text-lg font-semibold text-brand-500">
                {project.name}
              </h3>
              <p className="mt-2 text-sm text-slate-300">{project.description}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {project.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-800/60 px-2 py-1">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                {project.repoUrl && (
                  <a className="text-slate-300" href={project.repoUrl}>
                    Repository
                  </a>
                )}
                {project.liveUrl && (
                  <a className="text-slate-300" href={project.liveUrl}>
                    Live demo
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
        {others.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold">More Work</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {others.map((project) => (
                <div key={project.id} className="rounded-xl border border-slate-800 p-4">
                  <p className="font-semibold">{project.name}</p>
                  <p className="mt-2 text-sm text-slate-400">
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

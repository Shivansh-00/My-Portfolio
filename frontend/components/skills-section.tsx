import type { SkillCategory } from "@/types/api";

export default function SkillsSection({
  skills
}: {
  skills: SkillCategory[];
}) {
  return (
    <section className="section-card">
      <h2 className="section-title">Skills</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {skills.map((category) => (
          <div key={category.id} className="rounded-xl border border-slate-800 p-4">
            <h3 className="text-lg font-semibold text-brand-500">
              {category.name}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {category.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-slate-800/60 px-3 py-1"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

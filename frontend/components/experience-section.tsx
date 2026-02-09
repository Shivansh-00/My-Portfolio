import type { ExperienceItem } from "@/types/api";

export default function ExperienceSection({
  experience
}: {
  experience: ExperienceItem[];
}) {
  return (
    <section className="section-card">
      <h2 className="section-title">Experience</h2>
      <div className="mt-6 space-y-6">
        {experience.map((item) => (
          <div key={item.id} className="border-l border-slate-700 pl-4">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="text-sm text-slate-400">
              {item.organization} · {item.startDate} — {item.endDate ?? "Present"}
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
              {item.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

import type { Profile } from "@/types/api";
import ContactForm from "@/components/contact-form";

export default function ContactSection({ profile }: { profile: Profile }) {
  return (
    <section className="section-card">
      <h2 className="section-title">Contact</h2>
      <p className="mt-2 text-sm text-slate-300">
        Let’s build something impactful. Reach out directly at {profile.email} or
        use the form.
      </p>
      <div className="mt-6">
        <ContactForm />
      </div>
    </section>
  );
}

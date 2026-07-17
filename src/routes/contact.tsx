import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { submitComplaint } from "@/lib/hotel.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Owner's Line — Garen's Garden" },
      {
        name: "description",
        content:
          "Send a direct message to the owner of Garen's Garden. To reserve a room, use the Rooms page.",
      },
      { property: "og:title", content: "Contact — Garen's Garden" },
      { property: "og:description", content: "Message the owner directly." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const send = useServerFn(submitComplaint);
  const [form, setForm] = useState({ guest_name: "", guest_contact: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const mut = useMutation({
    mutationFn: (data: typeof form) => send({ data }),
    onSuccess: () => setSubmitted(true),
  });

  return (
    <div className="bg-deep font-sans text-gold-light min-h-screen antialiased">
      <SiteNav />
      <main className="pt-24 pb-24 md:pb-32 overflow-x-hidden">
        <section className="px-4 sm:px-6 py-12 md:py-16 max-w-7xl mx-auto animate-fade-in-up">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-6">Owner&rsquo;s Line</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-gold-light leading-tight max-w-3xl">
            Speak directly to the house.
          </h1>
          <p className="text-zinc-300/85 max-w-2xl leading-relaxed mt-4">
            To reserve a room, visit the Rooms page. This form goes straight to the owner &mdash; for
            concerns, feedback, or anything that shouldn&rsquo;t wait.
          </p>
        </section>

        <section className="px-4 sm:px-6 max-w-7xl mx-auto grid md:grid-cols-5 gap-8 md:gap-12">
          <div className="md:col-span-3 bg-warm/5 ring-1 ring-gold/10 p-4 sm:p-8 md:p-10 animate-fade-in-up delay-100 hover-glow">
            {submitted ? (
              <div className="text-center py-16">
                <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4">Received</p>
                <h2 className="font-serif text-3xl text-gold-light mb-4">Your message reached the owner.</h2>
                <p className="text-zinc-300/85 max-w-md mx-auto">
                  You&rsquo;ll hear back personally within a few hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  mut.mutate(form);
                }}
                className="space-y-6"
              >
                <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-2">Message the Owner</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="Your name"
                    value={form.guest_name}
                    onChange={(v) => setForm({ ...form, guest_name: v })}
                    required
                  />
                  <Field
                    label="Email or phone"
                    value={form.guest_contact}
                    onChange={(v) => setForm({ ...form, guest_contact: v })}
                    required
                  />
                </div>
                <Field
                  label="Subject"
                  value={form.subject}
                  onChange={(v) => setForm({ ...form, subject: v })}
                  required
                />
                <div>
                  <label className="text-[10px] uppercase tracking-[0.25em] text-gold/70 mb-2 block">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    className="w-full bg-transparent border border-gold/20 focus:border-gold/60 outline-none px-4 py-3 text-sm text-gold-light placeholder:text-zinc-500 transition-colors resize-none"
                    placeholder="Tell the owner what happened, or what would make your stay perfect."
                  />
                </div>
                {mut.error && <p className="text-sm text-red-300">{(mut.error as Error).message}</p>}
                <button
                  type="submit"
                  disabled={mut.isPending}
                  className="w-full bg-gold text-deep py-4 text-xs uppercase tracking-[0.25em] font-semibold hover:bg-gold-light transition-all active:scale-95 duration-300 hover-lift disabled:opacity-50"
                >
                  {mut.isPending ? "Sending…" : "Send to owner"}
                </button>
              </form>
            )}
          </div>

          <aside className="md:col-span-2 space-y-8">
            <div className="bg-gold text-deep p-5 sm:p-8 animate-fade-in-up delay-200 hover-lift">
              <p className="text-[10px] uppercase tracking-[0.25em] mb-3 font-medium opacity-70">
                Direct to Owner
              </p>
              <p className="font-serif text-2xl italic leading-tight mb-4">
                &ldquo;If something isn&rsquo;t right, I want to know first.&rdquo;
              </p>
              <p className="text-sm">
                Every message on this form is delivered straight to the owner&rsquo;s private vault
                &mdash; no gatekeeping, no filtering.
              </p>
            </div>

            <div className="bg-warm/5 ring-1 ring-gold/10 p-5 sm:p-8 space-y-4 animate-fade-in-up delay-300 hover-glow">
              <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-2">The House</p>
              <Info label="Reception" value="+234 (0) 800 000 0000" />
              <Info label="Check-in" value="3:00 PM daily" />
              <Info label="Check-out" value="11:00 AM daily" />
              <Info label="Address" value="Garen's Garden · Lagos, Nigeria" />
            </div>

            <a
              href="https://wa.me/2348103129471"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366]/10 ring-1 ring-[#25D366]/30 p-4 hover:bg-[#25D366]/15 transition-all active:scale-[0.98] duration-300 animate-fade-in-up delay-400 hover-lift min-w-0"
            >
              <svg className="size-8 text-[#25D366] shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold/60 mb-1">WhatsApp</p>
                <p className="text-sm text-gold-light font-medium">+234 810 312 9471</p>
              </div>
            </a>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.25em] text-gold/70 mb-2 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-transparent border border-gold/20 focus:border-gold/60 outline-none px-4 py-3 text-sm text-gold-light placeholder:text-zinc-500 transition-colors"
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.3em] text-gold/60 mb-1">{label}</p>
      <p className="text-sm text-gold-light">{value}</p>
    </div>
  );
}

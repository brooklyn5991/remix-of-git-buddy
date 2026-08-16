import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { submitComplaint } from "@/lib/hotel.functions";

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

export function InquiryForm({ eyebrow = "Message the Owner" }: { eyebrow?: string }) {
  const send = useServerFn(submitComplaint);
  const [form, setForm] = useState({ guest_name: "", guest_contact: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const mut = useMutation({
    mutationFn: (data: typeof form) => send({ data }),
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <div className="text-center py-16">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4">Received</p>
        <h2 className="font-serif text-3xl text-gold-light mb-4">Your message reached the owner.</h2>
        <p className="text-zinc-300/85 max-w-md mx-auto">
          You&rsquo;ll hear back personally within a few hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mut.mutate(form);
      }}
      className="space-y-6"
    >
      <p className="text-[10px] uppercase tracking-[0.4em] text-gold mb-2">{eyebrow}</p>
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
        <label className="text-[10px] uppercase tracking-[0.25em] text-gold/70 mb-2 block">Message</label>
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
  );
}

import { Resend } from "resend";
import { siteConfig } from "@/config/site.config";
import { absoluteUrl } from "@/lib/seo";

const COPY = {
  en: {
    subject: "New inquiry",
    about: "About",
    general: "General inquiry",
    from: "From",
    email: "Email",
    phone: "Phone",
    open: "Open in admin",
  },
  fr: {
    subject: "Nouvelle demande",
    about: "Concerne",
    general: "Demande générale",
    from: "De",
    email: "E-mail",
    phone: "Téléphone",
    open: "Ouvrir dans l'admin",
  },
} as const;

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

type Inquiry = {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  propertyTitle: string | null;
};

export async function sendInquiryNotification(i: Inquiry) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return; // email is optional

  const to = (process.env.NOTIFY_EMAILS ?? siteConfig.contact.email)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!to.length) return;

  const c = COPY[siteConfig.adminLocale];
  const adminUrl = absoluteUrl(siteConfig.adminLocale, "/admin/inquiries");
  const cell = "padding:6px 12px 6px 0;color:#64748b";

  const { error } = await new Resend(key).emails.send({
    from:
      process.env.EMAIL_FROM ?? `${siteConfig.name} <onboarding@resend.dev>`,
    to,
    replyTo: i.email,
    // strip line breaks so visitor input can never inject extra headers
    subject:
      `${c.subject}: ${i.name}${i.propertyTitle ? ` – ${i.propertyTitle}` : ""}`.replace(
        /[\r\n]+/g,
        " ",
      ),
    html: `<div style="font-family:system-ui,sans-serif;max-width:560px">
  <h2 style="margin:0 0 12px">${c.subject}</h2>
  <p style="margin:0 0 16px;color:#475569">${c.about}: <strong>${esc(i.propertyTitle ?? c.general)}</strong></p>
  <table style="border-collapse:collapse">
    <tr><td style="${cell}">${c.from}</td><td>${esc(i.name)}</td></tr>
    <tr><td style="${cell}">${c.email}</td><td><a href="mailto:${esc(i.email)}">${esc(i.email)}</a></td></tr>
    ${i.phone ? `<tr><td style="${cell}">${c.phone}</td><td>${esc(i.phone)}</td></tr>` : ""}
  </table>
  <p style="white-space:pre-wrap;border-left:3px solid #e2e8f0;padding-left:12px;margin:16px 0">${esc(i.message)}</p>
  <p><a href="${adminUrl}">${c.open}</a></p>
</div>`,
  });

  if (error) console.error("Resend error", error);
}

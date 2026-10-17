/** Modèles d'e-mails (HTML simple + version texte). */

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function layout(title: string, body: string): string {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f3efe7;font-family:Arial,Helvetica,sans-serif;color:#1d2422">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<p style="font-family:Georgia,serif;font-size:22px;margin:0 0 24px"><strong>H&amp;A</strong> <em>Signature</em></p>
<div style="background:#ffffff;border:1px solid #e2dacc;padding:28px">
<h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(title)}</h1>
${body}
</div>
<p style="font-size:12px;color:#5a5f58;margin-top:20px">E-mail automatique envoyé par le site H&amp;A Signature.</p>
</div></body></html>`;
}

const row = (label: string, value: string | null | undefined) =>
  value ? `<tr><td style="padding:6px 12px 6px 0;color:#5a5f58;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 0"><strong>${escapeHtml(value)}</strong></td></tr>` : "";

export type NewLeadEmailData = {
  name: string;
  phone: string;
  email: string | null;
  apartment: string | null;
  message: string | null;
  country: string | null;
  adminUrl: string;
};

export function newLeadEmail(d: NewLeadEmailData) {
  const subject = `Nouvelle demande : ${d.name}${d.apartment ? ` — ${d.apartment}` : ""}`;
  const html = layout(
    "Nouvelle demande de contact",
    `<table style="border-collapse:collapse;font-size:15px">
${row("Nom", d.name)}${row("Téléphone", d.phone)}${row("E-mail", d.email)}${row("Appartement", d.apartment ?? "Je ne sais pas encore")}${row("Pays", d.country)}
</table>
${d.message ? `<p style="margin:16px 0 0;padding:12px;background:#fbf9f5;border-left:3px solid #8a4b24;white-space:pre-line">${escapeHtml(d.message)}</p>` : ""}
<p style="margin:24px 0 0"><a href="${escapeHtml(d.adminUrl)}" style="display:inline-block;background:#8a4b24;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 18px">Voir dans l’administration</a></p>`,
  );
  const text = [
    "Nouvelle demande de contact",
    `Nom : ${d.name}`,
    `Téléphone : ${d.phone}`,
    d.email ? `E-mail : ${d.email}` : null,
    `Appartement : ${d.apartment ?? "Je ne sais pas encore"}`,
    d.country ? `Pays : ${d.country}` : null,
    d.message ? `\nMessage :\n${d.message}` : null,
    `\nAdministration : ${d.adminUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
  return { subject, html, text };
}

export function leadAcknowledgementEmail(d: { name: string; phone: string; siteName: string }) {
  const subject = `${d.siteName} — nous avons bien reçu votre demande`;
  const html = layout(
    `Merci ${d.name}`,
    `<p style="font-size:15px;line-height:1.6;margin:0">Votre demande est bien arrivée. Un conseiller vous rappelle rapidement au numéro indiqué.</p>
<p style="font-size:15px;line-height:1.6">Pour toute question, répondez simplement à cet e-mail ou appelez-nous au ${escapeHtml(d.phone)}.</p>`,
  );
  const text = `Merci ${d.name},\n\nVotre demande est bien arrivée. Un conseiller vous rappelle rapidement.\nPour toute question : ${d.phone}.`;
  return { subject, html, text };
}

export function passwordResetEmail(d: { name: string; url: string }) {
  const subject = "Réinitialisation de votre mot de passe";
  const html = layout(
    "Réinitialiser votre mot de passe",
    `<p style="font-size:15px;line-height:1.6;margin:0">Bonjour ${escapeHtml(d.name)}, une réinitialisation du mot de passe de l’administration a été demandée.</p>
<p style="margin:20px 0"><a href="${escapeHtml(d.url)}" style="display:inline-block;background:#8a4b24;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 18px">Choisir un nouveau mot de passe</a></p>
<p style="font-size:13px;color:#5a5f58">Ce lien est valable 1 heure et ne peut servir qu’une fois. Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.</p>`,
  );
  const text = `Bonjour ${d.name},\n\nPour choisir un nouveau mot de passe (lien valable 1 heure) :\n${d.url}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`;
  return { subject, html, text };
}

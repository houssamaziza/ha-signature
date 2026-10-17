/**
 * Envoi d'e-mails sans dépendance : appels HTTP aux fournisseurs.
 *   EMAIL_PROVIDER = "resend" | "brevo" | "console" (défaut : console en dev, erreur en prod)
 *   EMAIL_API_KEY  = clé API du fournisseur
 *   EMAIL_FROM     = "H&A Signature <noreply@hasignature.com>" (domaine vérifié chez le fournisseur)
 * Les deux fournisseurs ont une offre gratuite suffisante pour ce site.
 */
export type EmailMessage = {
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

function parseFrom(from: string): { name?: string; email: string } {
  const m = from.match(/^\s*(.*?)\s*<(.+)>\s*$/);
  return m ? { name: m[1] || undefined, email: m[2]! } : { email: from.trim() };
}

async function sendWithResend(msg: EmailMessage, apiKey: string, from: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: msg.to, subject: msg.subject, html: msg.html, text: msg.text, reply_to: msg.replyTo }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function sendWithBrevo(msg: EmailMessage, apiKey: string, from: string) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      sender: parseFrom(from),
      to: msg.to.map((email) => ({ email })),
      subject: msg.subject,
      htmlContent: msg.html,
      textContent: msg.text,
      ...(msg.replyTo ? { replyTo: { email: msg.replyTo } } : {}),
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
}

export async function sendEmail(msg: EmailMessage): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER ?? (process.env.NODE_ENV === "production" ? "" : "console");
  const apiKey = process.env.EMAIL_API_KEY ?? "";
  const from = process.env.EMAIL_FROM ?? "H&A Signature <noreply@hasignature.com>";

  if (msg.to.length === 0) return;
  switch (provider) {
    case "resend":
      return sendWithResend(msg, apiKey, from);
    case "brevo":
      return sendWithBrevo(msg, apiKey, from);
    case "console":
      console.info(`[email] À : ${msg.to.join(", ")}\nObjet : ${msg.subject}\n${msg.text}`);
      return;
    default:
      throw new Error("EMAIL_PROVIDER non configuré (resend, brevo ou console).");
  }
}

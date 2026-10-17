import { prisma } from "../db";
import { sendEmail } from "../email/mailer";
import { leadAcknowledgementEmail, newLeadEmail } from "../email/templates";
import { getSettings } from "../services/settings.service";
import { apartmentShortLabel } from "@/shared/apartments";
import { countryName } from "@/shared/geo";

/** Adresses qui reçoivent les nouvelles demandes : LEAD_NOTIFICATION_EMAILS, sinon l'e-mail du site. */
function recipients(fallback: string): string[] {
  const list = (process.env.LEAD_NOTIFICATION_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return list.length ? list : [fallback];
}

/**
 * Prévient l'équipe d'une nouvelle demande (et accuse réception au client s'il a
 * donné son e-mail et que LEAD_ACKNOWLEDGEMENT=true). Ne lève jamais d'erreur.
 */
export async function notifyNewLead(leadId: number): Promise<void> {
  try {
    const [lead, settings] = await Promise.all([
      prisma.lead.findUnique({ where: { id: leadId }, include: { apartment: true } }),
      getSettings(),
    ]);
    if (!lead) return;
    const base = process.env.SITE_URL ?? "http://localhost:3000";

    const team = newLeadEmail({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      apartment: lead.apartment ? apartmentShortLabel(lead.apartment) : null,
      message: lead.message,
      country: lead.country ? countryName(lead.country) : null,
      adminUrl: `${base}/admin/demandes`,
    });
    await sendEmail({ to: recipients(settings.email), ...team, replyTo: lead.email ?? undefined });

    if (lead.email && process.env.LEAD_ACKNOWLEDGEMENT === "true") {
      const ack = leadAcknowledgementEmail({ name: lead.name, phone: settings.phone, siteName: settings.siteName });
      await sendEmail({ to: [lead.email], ...ack, replyTo: settings.email });
    }
  } catch (err) {
    console.error("[notifier] e-mail de nouvelle demande non envoyé", err);
  }
}

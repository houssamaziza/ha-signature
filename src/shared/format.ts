/** Formatage partagé (web + mobile). */

const priceFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** 12000000 → "12 000 000 DA" */
export function formatPriceDa(amount: number): string {
  return `${priceFormatter.format(amount)} DA`;
}

/** Numéro d'appartement sur deux chiffres : 7 → "07". */
export function formatApartmentNumber(n: number): string {
  return String(n).padStart(2, "0");
}

/** Lien WhatsApp « click to chat » : https://wa.me/213550333769?text=… */
export function whatsappLink(internationalNumber: string, message?: string): string {
  const digits = internationalNumber.replace(/\D/g, "");
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${query}`;
}

/** Lien tel: à partir d'un numéro local algérien ou international. */
export function telLink(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return `tel:${digits}`;
  if (digits.startsWith("0")) return `tel:+213${digits.slice(1)}`;
  return `tel:${digits}`;
}

/** "+213550333769" → "+213 550 33 37 69" */
export function formatInternationalDz(number: string): string {
  const d = number.replace(/\D/g, "");
  const m = d.match(/^213(\d{3})(\d{2})(\d{2})(\d{2})$/);
  return m ? `+213 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : number;
}

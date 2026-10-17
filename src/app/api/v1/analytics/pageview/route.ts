import { readJson, tooManyRequests, withErrors } from "@/server/http/response";
import { rateLimit } from "@/server/http/rate-limit";
import { classifySource, clientKey, getCity, getCountry, getDevice } from "@/server/http/request-meta";
import { recordPageView } from "@/server/services/analytics.service";
import { pageViewSchema } from "@/shared/schemas/analytics";

const BOT_UA = /bot|crawler|spider|crawling|preview|facebookexternalhit|whatsapp/i;

/** POST /api/v1/analytics/pageview — envoyé par le navigateur après consentement. */
export const POST = withErrors(async (req) => {
  const headers = req.headers;
  const userAgent = headers.get("user-agent");
  if (BOT_UA.test(userAgent ?? "")) return new Response(null, { status: 204 });
  if (!rateLimit(`pv:${clientKey(headers)}`, 120, 60_000)) throw tooManyRequests();

  const input = pageViewSchema.parse(await readJson(req, 2_000));
  const ownHost = process.env.SITE_URL ? new URL(process.env.SITE_URL).hostname : headers.get("host");
  const { source, referrerHost } = classifySource(input.referrer, input.utmSource, ownHost);

  await recordPageView(input, {
    country: getCountry(headers),
    city: getCity(headers),
    device: getDevice(userAgent),
    source,
    referrerHost,
  });
  return new Response(null, { status: 204 });
});

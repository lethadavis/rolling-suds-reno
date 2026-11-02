// Takes a lead from either website form and writes it to HubSpot.
//
// HubSpot's form submission API quietly drops submissions for forms built in
// the new editor, so leads go to the CRM API instead. That needs a private
// app token, which must never reach the browser, which is why this runs here.
//
// Set HUBSPOT_TOKEN in Netlify under Site configuration > Environment
// variables. The token needs the crm.objects.contacts.write scope.
import { mapLead, isKnownForm } from "../../src/lib/hubspot-map.mjs";
import { SITE_URL } from "../../site.config.js";

const UPSERT = "https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert";

// HubSpot names the offending value in its errors. Email addresses and phone
// numbers are taken out before anything is logged. The rest of the message is
// kept, because without it a refusal cannot be diagnosed.
const redact = (text) =>
  String(text)
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    .replace(/\d[\d\s().-]{5,}\d/g, "[number]");

const reply = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

// Our own pages only. A missing Origin is allowed, because some browsers
// leave it off a same origin post, but a foreign one is turned away.
function originAllowed(req) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname;
    return (
      host === new URL(SITE_URL).hostname ||
      host === "localhost" ||
      host.endsWith(".netlify.app") ||
      host.endsWith("rollingsudsreno.com")
    );
  } catch {
    return false;
  }
}

export default async (req) => {
  if (req.method !== "POST") return reply({ error: "method not allowed" }, 405);
  if (!originAllowed(req)) return reply({ error: "forbidden" }, 403);

  const token = process.env.HUBSPOT_TOKEN;
  if (!token) {
    console.error("[lead] HUBSPOT_TOKEN is not set, nothing was sent to HubSpot");
    return reply({ error: "not configured" }, 500);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return reply({ error: "bad request" }, 400);
  }

  const { form, fields } = body || {};
  if (!isKnownForm(form) || !fields || typeof fields !== "object") {
    return reply({ error: "bad request" }, 400);
  }
  // Honeypot: answer as though it worked and send nothing.
  if (typeof fields["bot-field"] === "string" && fields["bot-field"].trim()) {
    return reply({ ok: true });
  }

  let properties;
  try {
    properties = mapLead(form, fields);
  } catch (err) {
    console.error("[lead] could not map the submission:", err.message);
    return reply({ error: "bad request" }, 400);
  }

  // HubSpot matches an existing contact on the email address, so a repeat
  // enquiry updates that contact rather than making a second one.
  if (!properties.email) return reply({ error: "email required" }, 400);

  let res;
  try {
    res = await fetch(UPSERT, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: [{ idProperty: "email", id: properties.email, properties }],
      }),
    });
  } catch (err) {
    console.error("[lead] could not reach HubSpot:", err.message);
    return reply({ error: "upstream unreachable" }, 502);
  }

  if (!res.ok) {
    let why = "";
    try {
      const parsed = await res.json();
      why = redact([parsed.category, parsed.message].filter(Boolean).join(": ")).slice(0, 200);
    } catch {
      why = "unreadable error body";
    }
    console.error(`[lead] HubSpot refused the ${form} lead: ${res.status} ${why}`);
    return reply({ error: "hubspot", status: res.status }, 502);
  }

  return reply({ ok: true });
};

// Turns one website form submission into HubSpot contact properties.
//
// This runs on the server only. The browser sends our own field names and
// never names a HubSpot property, so a crafted request cannot write to a
// property we did not choose here.
import { HUBSPOT } from "../../site.config.js";

const FORMS = {
  quote: { leadSource: HUBSPOT.leadSource.quote },
  contest: { leadSource: HUBSPOT.leadSource.contest, service: HUBSPOT.contestService },
};

export const isKnownForm = (form) => Object.prototype.hasOwnProperty.call(FORMS, form);

export function mapLead(form, raw) {
  const cfg = FORMS[form];
  if (!cfg) throw new Error(`unknown form: ${form}`);

  // Only the fields our own forms carry, trimmed and length capped.
  const data = {};
  for (const [key, value] of Object.entries(raw || {})) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) data[key] = trimmed.slice(0, 5000);
  }

  const map = HUBSPOT.fieldMap;
  const props = {};
  const set = (name, value) => {
    if (name && value) props[name] = String(value).slice(0, 65000);
  };

  // The name splits at the first space. Everything after it is the last name.
  if (data.name) {
    const [first, ...rest] = data.name.split(/\s+/);
    set(map.name, first);
    if (rest.length) set("lastname", rest.join(" "));
  }
  set(map.email, data.email);
  set(map.phone, data.phone);
  set(map.address, data.address || data.street); // the quote form keeps it in one field
  set(map.city, data.city);
  set(map.zip, data.zip);
  if (data.homeowner) set(map.homeowner, HUBSPOT.homeownerYes);

  // Preferred contact goes to the checkbox properties the HubSpot form uses,
  // so website leads look like form leads, and to the enumeration as well,
  // which is the only field that can hold the email choice.
  const chosen = (data.preferred_contact || "")
    .split(/[,;]\s*/)
    .map((v) => v.toLowerCase())
    .filter(Boolean);
  for (const key of Object.keys(HUBSPOT.contactCheckboxes)) {
    set(HUBSPOT.contactCheckboxes[key], chosen.includes(key) ? "true" : "false");
  }
  const methods = [...new Set(chosen.map((c) => HUBSPOT.contactMethods[c]).filter(Boolean))];
  if (methods.length) set(HUBSPOT.preferredContactProperty, methods.join(";"));

  set("lead_source", cfg.leadSource);

  // Service Selected takes its own options only. Anything else is named in
  // the notes so the answer survives.
  const spare = [];
  const service = cfg.service || data.service;
  if (service) {
    if (HUBSPOT.serviceOptions.includes(service)) set(map.service, service);
    else spare.push(`Requested service: ${service}`);
  }

  const tail = HUBSPOT.notesTail
    .filter(([key]) => data[key])
    .map(([key, label]) => `${label}: ${data[key]}`);
  set(
    HUBSPOT.notesProperty,
    [data.description, data.notes, ...spare, ...tail].filter(Boolean).join("\n")
  );

  return props;
}

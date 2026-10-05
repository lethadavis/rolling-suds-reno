// Deploy context, shared by the build and the page builders.
// Production means Netlify's production context on the SITE_URL host.
// Everything else (deploy previews, branch deploys, local) is staging.
import { SITE_URL } from "../site.config.js";

export const context = process.env.CONTEXT || "local";
const deployUrl = process.env.URL || "";
export const isProduction = context === "production" && deployUrl.includes(new URL(SITE_URL).host);

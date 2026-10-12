// Privacy Policy (/privacy-policy). Written for this site: it covers the same
// ground as the Rolling Suds Power Washing corporate policy
// (rollingsudspowerwashing.com/privacy-policy) but describes what
// rollingsudsreno.com itself collects and uses. Update PRIVACY_UPDATED
// whenever the text changes.
import { CONTACT } from "../../site.config.js";

export const PRIVACY_UPDATED = "October 12, 2026";

export function privacyBody() {
  return `<section class="page-hero">
  <div class="wrap">
    <span class="pill">Privacy</span>
    <h1>Privacy Policy</h1>
    <p>Last updated ${PRIVACY_UPDATED}</p>
  </div>
</section>

<section class="page-body">
  <div class="wrap">
    <div class="prose privacy">
      <p>This policy explains what information ${CONTACT.legalName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects through rollingsudsreno.com, how we use it, and the choices you have. We are a locally owned franchise of Rolling Suds Power Washing. The corporate website has its own <a href="https://www.rollingsudspowerwashing.com/privacy-policy/" target="_blank" rel="noopener">privacy policy</a>.</p>

      <h2>Information we collect</h2>
      <h3>Information you give us</h3>
      <p>When you request a quote or book a free driveway cleaning, we ask for the details we need to reply and to do the work:</p>
      <ul>
        <li>Your name, phone number and email address</li>
        <li>The service address, city and ZIP code</li>
        <li>The service you are interested in and any notes you add</li>
        <li>How you prefer to be contacted: phone call, text message or email</li>
        <li>For the free driveway cleaning, whether you own the home</li>
      </ul>
      <h3>Information collected automatically</h3>
      <p>We use Google Analytics to understand how people use the site, such as which pages are visited, how visitors arrive (for example from a postcard link or a search), the type of device and browser, and approximate location. Google Analytics uses cookies to do this. It does not give us your name or contact details.</p>

      <h2>How we use your information</h2>
      <ul>
        <li>To reply to your quote request and schedule and carry out the work</li>
        <li>To run the free driveway cleaning and the house wash giveaway, including contacting you about your booking and the drawing</li>
        <li>To contact you by phone, text or email about your request, using the method you choose</li>
        <li>To understand how the site is used and improve it</li>
      </ul>

      <h2>Text messages</h2>
      <p>If you choose text message as your preferred contact method, you agree to receive texts from ${CONTACT.legalName} about your request, your free cleaning and the giveaway. Message frequency varies. Message and data rates may apply. Reply STOP at any time to stop receiving texts. Mobile information is not shared with third parties or affiliates for their marketing or promotional purposes.</p>

      <h2>Cookies</h2>
      <p>Cookies are small text files a website stores in your browser. This site uses cookies set by Google Analytics to measure visits. Some pages also show content from other services that may set their own cookies: our YouTube videos (they load only when you press play) and the Google Map of our service area on the homepage.</p>
      <p>You can block or delete cookies in your browser settings, and you can opt out of Google Analytics with the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google Analytics opt-out browser add-on</a>. For more about cookies, see <a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener">allaboutcookies.org</a>.</p>

      <h2>Who we share it with</h2>
      <p>We share information only with the service providers that help us run this site and handle your requests, such as our website host, which receives form submissions, and Google Analytics. We may also share information when the law requires it.</p>

      <h2>Your choices</h2>
      <ul>
        <li>You can ask us to update or delete the contact details you have given us.</li>
        <li>You can change how we contact you at any time, or ask us to stop.</li>
        <li>Reply STOP to any text message to stop texts.</li>
      </ul>

      <h2>Other websites</h2>
      <p>This site links to other websites, including the Rolling Suds Power Washing corporate site, YouTube and Google Maps. Their privacy policies apply when you visit them.</p>

      <h2>Changes to this policy</h2>
      <p>We review this policy from time to time. Any changes are posted on this page with a new &ldquo;last updated&rdquo; date.</p>

      <h2>Contact us</h2>
      <p>Questions about this policy or your information? Call us at <a href="tel:{{PHONE_HREF}}">{{PHONE}}</a> or write to ${CONTACT.legalName}, {{STREET}}, {{CITY_STATE_ZIP}}.</p>
    </div>
  </div>
</section>`;
}

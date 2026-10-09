// "Preferred method of contact" group, shared by every lead form.
// The checkboxes carry no name: site.js joins the ticked ones into the hidden
// preferred_contact field ("phone, email"), which each form places first so it
// leads the submission and the notification email.
export const contactPrefHidden = '<input type="hidden" name="preferred_contact" value="">';

// single: true renders radio buttons named preferred_contact (one choice, no
// hidden field); otherwise checkboxes feeding the hidden field above.
export function contactPref(prefix, { single = false } = {}) {
  const opt = (value, label) =>
    single
      ? `<label class="contact-opt"><input type="radio" name="preferred_contact" value="${value}" aria-describedby="${prefix}-contact-err"> ${label}</label>`
      : `<label class="contact-opt"><input type="checkbox" value="${value}" aria-describedby="${prefix}-contact-err"> ${label}</label>`;
  const hint = single ? "" : ' <span class="contact-hint">Choose any</span>';
  return `<fieldset class="contact-pref" data-contact-group${single ? ' data-single=""' : ""} aria-describedby="${prefix}-contact-err">
          <legend>Preferred method of contact <span aria-hidden="true">*</span>${hint}</legend>
          <div class="contact-options">
            ${opt("phone", "Phone call")}
            ${opt("text", "Text message")}
            ${opt("email", "Email")}
          </div>
          <p class="sms-consent" hidden>By choosing text, you agree to receive texts from Rolling Suds Reno-Tahoe about your request. Message and data rates may apply. Reply STOP to opt out.</p>
          <p class="field-err" id="${prefix}-contact-err" hidden></p>
        </fieldset>`;
}

import { getJitCafeAssetPath } from "../lib/paths";

export function ContactUsPage() {
  const contactDetails = [
    {
      href: "tel:+13125550197",
      label: "Phone",
      note: "Best for same-day pickup questions, timing changes, and order follow-up.",
      value: "(312) 555-0197",
    },
    {
      href: "mailto:hello@jitcafe.com",
      label: "Email",
      note: "Use for larger requests, menu questions, and anything that needs detail.",
      value: "hello@jitcafe.com",
    },
  ];

  const hours = [
    { day: "Monday", time: "10:30 AM-9:00 PM" },
    { day: "Tuesday", time: "10:30 AM-9:00 PM" },
    { day: "Wednesday", time: "10:30 AM-9:00 PM" },
    { day: "Thursday", time: "10:30 AM-9:00 PM" },
    { day: "Friday", time: "10:30 AM-10:00 PM" },
    { day: "Saturday", time: "11:00 AM-10:00 PM" },
    { day: "Sunday", time: "Closed" },
  ];

  return (
    <div className="contact-page-shell">
      <section className="contact-page-hero" aria-labelledby="contact-page-title">
        <header className="contact-page-hero-copy">
          <p className="contact-page-eyebrow">Contact us</p>
          <h1 id="contact-page-title" className="contact-page-title">
            JIT_Cafe
          </h1>
        </header>

        <aside className="contact-page-signature" aria-label="JIT Cafe brand mark">
          <img
            src={getJitCafeAssetPath("logo-mark.png")}
            alt="JIT Cafe logo"
            className="contact-page-signature-logo"
            width="1024"
            height="1024"
          />
        </aside>
      </section>

      <section className="contact-page-sheet" aria-label="Contact details">
        <div className="contact-page-sheet-main">
          <p className="contact-page-sheet-label">Get in touch</p>
          <dl className="contact-page-detail-list">
            {contactDetails.map((detail) => (
              <div key={detail.label} className="contact-page-detail-row">
                <dt className="contact-page-detail-term">{detail.label}</dt>
                <dd className="contact-page-detail-value">
                  <a href={detail.href} className="contact-page-detail-link">
                    {detail.value}
                  </a>
                </dd>
                <dd className="contact-page-detail-note">{detail.note}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="contact-page-hours">
          <div className="contact-page-hours-card">
            <p className="contact-page-sheet-label">Counter hours</p>
            <div className="contact-page-hours-list">
              {hours.map((entry) => (
                <div key={entry.day} className="contact-page-hours-row">
                  <p className="contact-page-hours-day">{entry.day}</p>
                  <p className="contact-page-hours-time">{entry.time}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

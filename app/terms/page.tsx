export const metadata = { title: 'Terms of Service — Party Time' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F6F7F9] px-6 py-16">
      <article className="mx-auto max-w-2xl text-[#1E2330] font-[family-name:var(--font-sans)] leading-relaxed">
        <h1 className="font-[family-name:var(--font-display)] font-bold text-3xl mb-2">Terms of Service</h1>
        <p className="text-sm text-[#9BA3B5] mb-10">Last updated: October 28, 2026</p>

        <section className="space-y-4 mb-10">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-xl">Overview</h2>
          <p>Party Time is an event invitation platform that allows event hosts to send personalized SMS invitations and manage RSVPs for their events. By using this service, you agree to these terms.</p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-xl">SMS Terms</h2>
          <p>Party Time sends text messages to event guests on behalf of event hosts. By being added as a guest to an event, you consent to receive the following SMS messages:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Event invitation messages containing event details and a unique RSVP link.</li>
            <li>Event reminder messages sent at the host&apos;s discretion.</li>
          </ul>
          <p><strong>Opting out:</strong> You can stop receiving messages at any time by replying <strong>STOP</strong> to any message from Party Time. You will receive a confirmation that you have been unsubscribed and will not receive any further messages from this number.</p>
          <p><strong>Help:</strong> Reply <strong>HELP</strong> to any message for assistance, or contact <a href="mailto:carolina.argento@etp.net" className="text-[#7C6E8A] underline">carolina.argento@etp.net</a>.</p>
          <p><strong>Message frequency:</strong> Message frequency varies by event. Typically 1–3 messages per event (invitation plus optional reminders). No recurring or automated marketing messages are sent.</p>
          <p><strong>Rates:</strong> Message and data rates may apply. Check with your mobile carrier for details.</p>
          <p><strong>Supported carriers:</strong> Service is available on all major US carriers including AT&amp;T, Verizon, T-Mobile, and others.</p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-xl">Event Host Responsibilities</h2>
          <p>Event hosts who use Party Time agree to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Only add guests whose phone numbers they have obtained with consent.</li>
            <li>Use the platform solely for legitimate event invitations, not for marketing or spam.</li>
            <li>Provide accurate event information in their invitations.</li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-xl">Acceptable Use</h2>
          <p>You agree not to use Party Time to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Send unsolicited or spam messages.</li>
            <li>Harass, threaten, or harm any individual.</li>
            <li>Violate any applicable laws or regulations, including the Telephone Consumer Protection Act (TCPA).</li>
          </ul>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-xl">Limitation of Liability</h2>
          <p>Party Time is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for message delivery failures, carrier fees, or any damages arising from the use of this service.</p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-xl">Changes to These Terms</h2>
          <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the updated terms.</p>
        </section>

        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-xl">Contact</h2>
          <p>Questions about these terms? Contact <a href="mailto:carolina.argento@etp.net" className="text-[#7C6E8A] underline">carolina.argento@etp.net</a>.</p>
        </section>
      </article>
    </div>
  )
}

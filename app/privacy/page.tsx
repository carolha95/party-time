export const metadata = { title: 'Privacy Policy — Party Time' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F6F7F9] px-6 py-16">
      <article className="mx-auto max-w-2xl text-[#1E2330] font-[family-name:var(--font-sans)] leading-relaxed">
        <h1 className="font-[family-name:var(--font-display)] font-bold text-3xl mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#9BA3B5] mb-10">Last updated: October 28, 2026</p>

        <section className="space-y-4 mb-10">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-xl">What We Collect</h2>
          <p>Party Time collects the following personal information solely for the purpose of delivering event invitations and managing RSVPs:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Guest name</strong> — used to personalize invitation messages.</li>
            <li><strong>Phone number</strong> — used to send SMS event invitations, RSVP confirmations, and event reminders via Twilio.</li>
            <li><strong>RSVP response</strong> — used to track attendance for the event host.</li>
          </ul>
          <p>We do not collect email addresses from guests, browsing data, cookies for tracking, or any financial information.</p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-xl">How We Use Your Information</h2>
          <p>Guest information is used exclusively to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Send a one-time SMS invitation with event details and an RSVP link.</li>
            <li>Send optional event reminders at the host&apos;s request.</li>
            <li>Display RSVP status to the event host in the admin dashboard.</li>
          </ul>
          <p>We do not sell, rent, or share your personal information with any third parties for marketing purposes. Your phone number is shared only with Twilio, our SMS delivery provider, for the sole purpose of delivering messages to you.</p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-xl">SMS Messaging</h2>
          <p>By having your phone number added to an event guest list, you may receive the following text messages from Party Time:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>An event invitation with a personalized RSVP link.</li>
            <li>Optional event reminders sent by the event host.</li>
          </ul>
          <p>Message frequency varies by event. Message and data rates may apply. You can opt out of messages at any time by replying <strong>STOP</strong> to any message. Reply <strong>HELP</strong> for assistance.</p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-xl">Data Retention</h2>
          <p>Guest information is retained only for the duration of the event. Event hosts may delete events and all associated guest data at any time through the admin dashboard.</p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-xl">Data Security</h2>
          <p>We use industry-standard security measures to protect your personal information. Guest data is stored securely in a Supabase database with row-level security policies. All data transmission occurs over encrypted HTTPS connections.</p>
        </section>

        <section className="space-y-4 mb-10">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-xl">Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Opt out of SMS messages at any time by replying STOP.</li>
            <li>Request deletion of your personal information by contacting the event host.</li>
            <li>Request access to the personal information we hold about you.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-xl">Contact</h2>
          <p>For privacy-related questions or requests, contact us at <a href="mailto:carolina.argento@etp.net" className="text-[#7C6E8A] underline">carolina.argento@etp.net</a>.</p>
        </section>
      </article>
    </div>
  )
}

/* ============================================================================
   /ai-cold-calling-rules-india — TRAI / DLT / DPDP compliance guide.

   Target query: "is ai cold calling illegal in india" (+ the DLT registration
   cluster: process, full form, documents required, charges).

   ⚠️  ACCURACY OVER PERSUASION on this page. It is the page most likely to earn
   citations, and the one where being wrong costs the most. Every factual claim
   below traces to a primary source or a dated regulator action:

     - TCCCPR 2018 + Feb 2025 amendment .... trai.gov.in/tcccpr
     - 140 / 1600 series ................... TRAI clarification, July 2026
     - AI/ML UCC detection direction ....... TRAI, March 2026
     - Draft Third Amendment ............... TRAI, 13 March 2026 (STILL A DRAFT)
     - DPDP Act 2023 + DPDP Rules 2025 ..... notified 13 Nov 2025, gazetted 14 Nov
     - IT Amendment Rules 2026 (SGI) ....... in force 20 Feb 2026

   Two things this page deliberately does NOT do, because competitors do them
   and they are wrong:
     1. It does not claim voice calls need DLT *content template* registration.
        Templates are the SMS framework; voice needs registered voice headers.
     2. It does not state flatly that Indian law compels an AI to announce
        itself. The IT Rules SGI obligations sit on intermediaries publishing
        content, not obviously on a live 1:1 phone call. We say it is unsettled
        and recommend disclosure anyway.

   Re-check the "Last reviewed" date and the draft-amendment status whenever
   TRAI moves. If the Third Amendment is notified, this page needs an edit.
   ========================================================================== */

const SITE = 'https://artintele.ai';
const URL = '/ai-cold-calling-rules-india';

const FAQ = [
  [
    'Is AI cold calling illegal in India?',
    'No. There is no Indian law banning an AI from placing a commercial call. What is illegal is making unsolicited commercial calls without being a registered telemarketer, calling numbers registered on the DND/NCPR preference list for that sector, calling outside 9am–9pm, or calling without a lawful basis under the DPDP Act. Those rules apply identically to a human dialling and to software dialling.',
  ],
  [
    'What is DLT registration?',
    'DLT registration is the mandatory process of registering your business as a Principal Entity on a telecom operator’s Distributed Ledger Technology platform before you may send commercial SMS or place commercial voice calls in India. It was introduced by TRAI under TCCCPR 2018 to make every commercial communication traceable to an identified sender.',
  ],
  [
    'What is the full form of DLT?',
    'DLT stands for Distributed Ledger Technology — the blockchain-based registry TRAI mandated under TCCCPR 2018 so that every registered sender, header and template is recorded on a tamper-evident ledger shared across telecom operators.',
  ],
  [
    'What documents are required for DLT registration?',
    'Typically your company PAN, GST registration certificate, certificate of incorporation or equivalent business registration, the authorised signatory’s PAN and Aadhaar, and a Letter of Authorisation on company letterhead. Individual operator portals may ask for more; check the specific portal before you start.',
  ],
  [
    'What are the DLT registration charges?',
    'Charges are set by each telecom operator, not by TRAI, and change from time to time. As a guide, some operators charge nothing for Principal Entity registration while others charge in the region of ₹5,900 including GST, with smaller annual renewal fees and a nominal per-header or per-template approval charge. Registering on one operator’s platform generally makes registration on the others free. Confirm current pricing on the operator portal.',
  ],
  [
    'What are the TRAI rules for telemarketing calls?',
    'Register as a telemarketer or Principal Entity, place calls only from voice headers registered with a telecom operator in the correct number series, scrub every list against the DND/NCPR preference register immediately before dialling, keep calls within 9am to 9pm, honour opt-outs at once, and keep consent and call records. Since the February 2025 amendment, five or more unique complaints against a sender inside ten days obliges the operator to suspend outgoing service and investigate; repeat violations can mean disconnection for up to a year.',
  ],
  [
    'Does an AI caller have to disclose that it is an AI?',
    'The position is genuinely unsettled. No provision of TCCCPR 2018 requires an automated caller to announce that it is automated. The IT Amendment Rules 2026 require synthetically generated audio to carry an audio disclosure, but those obligations are drafted for intermediaries publishing content rather than for a live one-to-one phone call, so they do not clearly bite on outbound calling. Given the direction of regulation and the rules against impersonating a specific individual, we disclose on every call and recommend you do the same. Take your own legal advice.',
  ],
];

const BODY = `<main class="legal">

  <p class="updated">Last reviewed 11 August 2026</p>
  <h1>Is AI Cold Calling Legal in India?</h1>

  <p class="lead"><strong>Yes — AI cold calling is legal in India, with conditions.</strong> No Indian law bans an automated voice from placing a commercial call. What the law restricts is who may call, whom they may call, when, and from which number. Break those rules and the liability is yours, whether a human or software dialled.</p>

  <p>That distinction matters, because the question is usually asked the wrong way round. India&rsquo;s telemarketing regime is technology-neutral: the <a href="https://trai.gov.in/tcccpr" rel="nofollow noopener" target="_blank">Telecom Commercial Communications Customer Preference Regulations, 2018</a> (TCCCPR 2018) govern the <em>commercial call</em>, and say nothing about what produces the voice on the line. There is no separate AI licence to obtain, and no AI exemption to hide behind.</p>

  <p>Nearly every enforcement action reported in India has been against unregistered senders and calls to people who had opted out — failures of process, not of technology. So the practical question is not &ldquo;may we use AI?&rdquo; but &ldquo;is our calling programme compliant?&rdquo; This page walks through what that means, in plain language.</p>

  <h2>What TRAI actually regulates</h2>

  <p>TCCCPR 2018 exists to control Unsolicited Commercial Communication (UCC). Its core obligations for anyone making commercial calls:</p>

  <ul>
    <li><strong>Be registered.</strong> Commercial calls must come from a registered sender — a Principal Entity, calling directly or through a registered telemarketer. Unregistered telemarketers (UTMs) are the regulator&rsquo;s primary enforcement target.</li>
    <li><strong>Respect subscriber preference.</strong> Every list must be scrubbed against the DND / National Customer Preference Register before dialling. Preferences are set per sector, so a number that accepts banking calls may block real-estate calls.</li>
    <li><strong>Keep to the window.</strong> Promotional calls are not permitted between 9pm and 9am, regardless of consent.</li>
    <li><strong>Use registered voice headers.</strong> Calls must originate from a calling line identity registered with your telecom operator, in the correct series (see below).</li>
    <li><strong>Honour opt-outs immediately</strong> and retain evidence of consent and of the call.</li>
  </ul>

  <p>Enforcement has sharpened considerably. The <strong>February 2025 amendment</strong> to TCCCPR obliges an operator to suspend a sender&rsquo;s outgoing services and open an investigation once <strong>five or more unique complaints</strong> are received against it within ten days; repeat violations can result in disconnection for up to a year. In 2025 TRAI issued more than <strong>731,000 notices</strong> to unregistered telemarketers against roughly 3.1 million spam complaints.</p>

  <p>In <strong>March 2026</strong> TRAI directed telecom operators to deploy AI and machine-learning systems to detect UCC proactively — monitoring signals such as call-recipient diversity, very short call durations and lopsided outgoing-to-incoming ratios — and to share sender KYC data with other operators within two hours of a request. The point for anyone running outbound campaigns: <em>your dialling pattern is now itself a compliance signal</em>. High-volume, low-duration, low-answer-rate calling looks like spam to a classifier even when every number on the list consented.</p>

  <p>TRAI also published a <strong>draft Third Amendment on 13 March 2026</strong>, which would lower the complaint threshold from five to three where an operator&rsquo;s AI system has already flagged the number in the same ten-day window. <strong>This remains a draft and is not in force.</strong> Notably, the draft does not let AI flags trigger action on their own — subscriber complaints still have to corroborate them.</p>

  <p>TRAI publishes its own plain-language guidance for <a href="https://www.trai.gov.in/advice-telemarketers" rel="nofollow noopener" target="_blank">telemarketers</a> and <a href="https://trai.gov.in/advice-to-senders" rel="nofollow noopener" target="_blank">senders</a>, plus an <a href="https://www.trai.gov.in/faqcategory/unsolicited-commercial-communicationsucc" rel="nofollow noopener" target="_blank">official UCC FAQ</a>. If anything on this page conflicts with those, they win.</p>

  <h2>Which number your call must come from: 140 vs 1600</h2>

  <p>This trips up more businesses than any other rule, and getting it wrong is visible to every recipient. TRAI has designated two series for commercial calling, and they are not interchangeable.</p>

  <table>
    <thead>
      <tr><th>Series</th><th>What it is for</th><th>Who may use it</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>140xx</strong></td>
        <td>Promotional and marketing calls</td>
        <td>Entities of any sector, after registering with a telecom operator under TCCCPR</td>
      </tr>
      <tr>
        <td><strong>1600xx</strong></td>
        <td>Service and transactional calls only — OTP and payment alerts, policy updates, account information. No promotion.</td>
        <td>Restricted. Entities regulated by RBI, SEBI, IRDAI or PFRDA contacting existing customers, and government departments for government-to-citizen communication.</td>
      </tr>
    </tbody>
  </table>

  <p>In a clarification issued in <strong>July 2026</strong>, TRAI confirmed that calls from these designated series may not be tagged, filtered or blocked by third-party apps — the sole permitted block being a subscriber&rsquo;s own DND registration against promotional calls from that sector. That is a genuine advantage of doing this properly: a compliant 140-series call reaches the handset unlabelled, while a call from an ordinary 10-digit mobile number is increasingly flagged as spam by the recipient&rsquo;s own phone.</p>

  <p>The practical consequence for most businesses: <strong>if you are generating leads, qualifying enquiries or following up prospects, you belong on 140.</strong> The 1600 series is not available to you unless you are a financial-sector entity regulated by one of those four authorities, or a government body — and even then only for genuinely non-promotional contact with existing customers.</p>

  <h2>DLT registration, step by step</h2>

  <p><strong>DLT stands for Distributed Ledger Technology.</strong> It is the blockchain-based registry TRAI mandated under TCCCPR 2018 so that every commercial communication in India traces back to an identified, accountable sender. Each major telecom operator runs its own DLT portal, and the registrations are shared between them.</p>

  <p><strong>Who has to register:</strong> the business whose goods or services are being promoted — the Principal Entity. You cannot delegate that identity to an agency. If a vendor offers to make calls &ldquo;on their own DLT registration&rdquo; on your behalf, they are describing a registered-telemarketer arrangement, and you should confirm the registration exists.</p>

  <p><strong>The one distinction most guides get wrong.</strong> DLT registration is widely explained in SMS terms — register a header, then register a content template for every message. Content-template registration is an <em>SMS</em> requirement. For voice, the obligation is to register your <strong>voice headers (the calling line identity)</strong> with your telecom operator in the correct series and to call only from them. You do not lodge a script for pre-approval the way you lodge an SMS template. That does not make voice a soft option — your calls are still subject to preference scrubbing, time windows, complaint thresholds and, since March 2026, operator-side AI monitoring.</p>

  <p><strong>Documents you will typically need:</strong></p>

  <ul>
    <li>Company PAN</li>
    <li>GST registration certificate</li>
    <li>Certificate of incorporation, or equivalent proof of business registration</li>
    <li>Authorised signatory&rsquo;s PAN and Aadhaar</li>
    <li>Letter of Authorisation on company letterhead, signed — usually downloadable from the portal itself</li>
  </ul>

  <p><strong>Charges.</strong> These are set by the individual telecom operators rather than by TRAI, and they change. As a guide: some operators levy no fee for Principal Entity registration while others charge in the region of ₹5,900 including GST, with a smaller annual renewal and a nominal per-header approval fee. Once you have registered on one operator&rsquo;s platform, registering on the others is generally free. Always confirm current pricing on the portal before budgeting.</p>

  <p><strong>Timeline.</strong> Straightforward Principal Entity registrations are often approved within a few working days; header approvals are usually quicker. Most delay comes from document mismatches — a business name that does not match the PAN exactly, or an unsigned Letter of Authorisation. Get those right first time and the process is undramatic.</p>

  <h2>Consent under the DPDP Act</h2>

  <p>TRAI governs the telecom channel. A separate statute governs the personal data flowing through it: the <strong>Digital Personal Data Protection Act, 2023</strong>. The <a href="https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf" rel="nofollow noopener" target="_blank">DPDP Rules, 2025</a> that operationalise it were notified on 13 November 2025 and gazetted the following day, with obligations phased in and full compliance expected by <strong>13 May 2027</strong>. Both are published via <a href="https://www.meity.gov.in/data-protection-framework" rel="nofollow noopener" target="_blank">MeitY&rsquo;s data protection framework</a>.</p>

  <p>If you are calling people, you are a <strong>Data Fiduciary</strong> processing their personal data, and three obligations bear directly on outbound calling:</p>

  <ul>
    <li><strong>Notice.</strong> Where processing rests on consent, you must give a clear, plain-language notice covering what data you collect, the purpose, how the person exercises their rights, and how they complain to the Data Protection Board. It must be available in English or any of the 22 languages in the Eighth Schedule to the Constitution — a requirement that lands squarely on anyone running multilingual campaigns.</li>
    <li><strong>Consent quality.</strong> Consent must be free, specific, informed, unconditional and unambiguous, and withdrawable as easily as it was given. This is where bought lead lists fail: a number scraped from a portal or bought from a broker carries no consent you can evidence, and &ldquo;the vendor said it was opted in&rdquo; is not a record.</li>
    <li><strong>Call recordings are personal data.</strong> If you record calls — and for quality and dispute purposes you probably should — recordings must be kept only as long as the stated purpose requires, secured, and deleted on schedule. Indefinite retention &ldquo;just in case&rdquo; is the default failure mode.</li>
  </ul>

  <p>The Act&rsquo;s penalty schedule runs to substantial figures — up to ₹250 crore for a failure to take reasonable security safeguards — but the realistic exposure for a mid-sized business is more mundane and more likely: a complaint you cannot answer because you have no consent record.</p>

  <h2>Does an AI voice change anything legally?</h2>

  <p>This is the genuinely novel question, and the honest answer is that it is <strong>partly unsettled</strong>. We would rather say that than give you false certainty, because several vendors currently state the position more confidently than the law supports.</p>

  <p>What is clear:</p>

  <ul>
    <li><strong>TCCCPR 2018 contains no requirement that an automated caller announce itself.</strong> Its obligations attach to registration, preference and timing, not to the nature of the voice.</li>
    <li><strong>The IT Amendment Rules 2026</strong> — amending the Intermediary Guidelines and in force from <strong>20 February 2026</strong> — regulate &ldquo;synthetically generated information&rdquo;, defined to include audio created or altered by computational means to appear authentic. Where such audio is published, it must carry a prominent <em>audio</em> disclosure.</li>
    <li><strong>Impersonating a specific real individual is squarely in scope.</strong> Cloning an identifiable person&rsquo;s voice for an outbound campaign is a clear and avoidable risk.</li>
  </ul>

  <p>What is not clear: those SGI obligations are drafted for <em>intermediaries publishing content on platforms</em>, not for a live one-to-one telephone conversation. On a plain reading they do not squarely bite on an outbound call. But the drafting direction is unmistakable, and general consumer-protection principles against misleading conduct point the same way.</p>

  <p><strong>Our position:</strong> our agents identify themselves as an AI assistant at the start of every call, and we do not clone the voice of any real person without their written permission. We do that because it is where regulation is clearly heading, because it removes a whole category of dispute, and because — in practice — callers who are told plainly do not object nearly as often as people expect. Disclosure costs you very little and buys certainty.</p>

  <p>This page is general information, not legal advice. Take advice on your own facts before launching a campaign, particularly in a regulated sector where RBI, IRDAI, SEBI or RERA obligations sit on top of everything above.</p>

  <h2>A compliance checklist</h2>

  <p>Before your first outbound campaign:</p>

  <ul>
    <li>Register as a Principal Entity on a telecom operator&rsquo;s DLT platform — or confirm in writing that your calling partner is a registered telemarketer.</li>
    <li>Obtain and use registered voice headers in the correct series. 140 for promotional; 1600 only if you genuinely qualify.</li>
    <li>Scrub every list against DND / NCPR <em>immediately before dialling</em>, not at the point of upload. Preferences change daily, so a list cleared last week is not cleared today.</li>
    <li>Hard-code the 9am–9pm window into the dialler rather than relying on campaign discipline.</li>
    <li>Record, for every number, where the consent came from, when, and for what purpose — retrievable on demand.</li>
    <li>Publish a DPDP-compliant notice, and make it available in the languages you actually call in.</li>
    <li>Process opt-outs immediately and irreversibly, across every channel.</li>
    <li>Set an explicit retention period for recordings and transcripts, and automate the deletion.</li>
    <li>Have the AI identify itself as an AI at the start of the call.</li>
    <li>Monitor your own complaint rate. Five unique complaints in ten days is the level at which your operator must act — you want to know before they do.</li>
    <li>Watch for the Third Amendment being notified, and for sector rules from RBI, IRDAI, SEBI or RERA if they apply to you.</li>
  </ul>

  <h2>Where ArtIntele fits</h2>

  <p>We build <a href="/services">AI voice agents and telecallers</a> for businesses <a href="/industries">across sectors</a> in India, and compliance is part of the build rather than a document handed over at the end: registered headers on the right series, dial-time preference scrubbing, enforced calling windows, consent and recording retention you can evidence, and disclosure on every call.</p>

  <p>If you want to talk through a specific calling programme — what it needs, and whether it is workable as designed — <a href="/contact">book a free consultation</a> and we will go through it with you. Pricing is on the <a href="/pricing">pricing page</a>.</p>

  <h2>Questions, answered</h2>

${FAQ.map(([q, a]) => `  <h2 style="font-size:19px;margin:26px 0 8px;">${q}</h2>\n  <p>${a}</p>`).join('\n\n')}

</main>`;

module.exports = {
  file: 'ai-cold-calling-rules-india.html',
  url: URL,
  layout: 'legal',
  title: 'Is AI Cold Calling Legal in India? TRAI &amp; DLT Rules',
  description:
    'A plain-English guide to TRAI rules, DLT registration and DPDP consent for AI voice calls in India — what is allowed, and how to stay compliant.',
  ogTitle: 'Is AI Cold Calling Legal in India? TRAI, DLT & DPDP Rules',
  body: BODY,
  schema: [
    {
      '@type': 'Article',
      '@id': `${SITE}${URL}#article`,
      headline: 'Is AI Cold Calling Legal in India? TRAI, DLT and DPDP Rules',
      description:
        'What TRAI regulates, how DLT registration works for voice, what the DPDP Act requires for consent, and whether an AI caller must disclose that it is an AI.',
      datePublished: '2026-08-11',
      dateModified: '2026-08-11',
      inLanguage: 'en-IN',
      author: { '@type': 'Organization', name: 'ArtIntele.ai', url: `${SITE}/` },
      publisher: {
        '@type': 'Organization',
        name: 'ArtIntele.ai',
        url: `${SITE}/`,
        logo: { '@type': 'ImageObject', url: `${SITE}/assets/img/logo.png` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}${URL}` },
      about: [
        { '@type': 'Thing', name: 'TCCCPR 2018' },
        { '@type': 'Thing', name: 'DLT registration' },
        { '@type': 'Thing', name: 'Digital Personal Data Protection Act 2023' },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE}${URL}#faq`,
      mainEntity: FAQ.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Is AI Cold Calling Legal in India?',
          item: `${SITE}${URL}`,
        },
      ],
    },
  ],
};

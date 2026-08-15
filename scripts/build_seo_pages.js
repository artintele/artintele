#!/usr/bin/env node
/**
 * Generates the standalone SEO pages (services, industries and the individual
 * blog posts) from the shared chrome in frontend/blog.html.
 *
 * Why a generator: every page in this site inlines the same ~50KB critical CSS
 * and repeats the nav and footer verbatim. Hand-copying that into new pages
 * guarantees they drift. This lifts the chrome from one source page instead, so
 * new pages are identical to the rest of the site by construction.
 *
 * Blog post bodies come from scripts/blog-posts.js. They used to live inline on
 * blog.html as #anchors, which meant none of them could rank; blog.html is now
 * an index of cards and the post bodies are edited in that content module.
 *
 *   node scripts/build_seo_pages.js
 *
 * Output is committed to the repo (Vite treats every top-level HTML file as an
 * entry), so re-run it whenever the nav, footer or critical CSS changes.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FRONTEND = path.join(ROOT, 'frontend');
const SITE = 'https://artintele.ai';
const ASSET_V = '20260811.1';

const source = fs.readFileSync(path.join(FRONTEND, 'blog.html'), 'utf8');
const POSTS = require('./blog-posts.js');

// ---------------------------------------------------------------------------
// Lift the shared chrome out of blog.html
// ---------------------------------------------------------------------------
function slice(from, to, label) {
  const a = source.indexOf(from);
  const b = source.indexOf(to, a);
  if (a === -1 || b === -1) throw new Error(`could not locate chrome: ${label}`);
  return source.slice(a, b + to.length);
}

const HEAD_OPEN = source.slice(0, source.indexOf('<title>'));
const HEAD_ASSETS = slice('<link rel="preload" as="font"', '</head>', 'head assets');
const BODY_OPEN = slice('<body>', '</nav>', 'body open + nav');
const FOOTER = source.slice(source.indexOf('<footer id="footer">'));

function extractArticle(id) {
  const post = POSTS[id];
  if (!post) throw new Error(`no post content for: ${id}`);
  return post;
}

// ---------------------------------------------------------------------------
// Page definitions
// ---------------------------------------------------------------------------
function articlePage(id, meta) {
  const a = extractArticle(id);
  return {
    file: meta.file,
    url: meta.url,
    title: meta.title,
    description: meta.description,
    ogTitle: a.heading,
    kicker: meta.kicker,
    h1: a.heading,
    sub: meta.sub,
    schema: [
      {
        '@type': 'BlogPosting',
        '@id': `${SITE}${meta.url}#article`,
        headline: a.heading,
        description: meta.description,
        datePublished: meta.published,
        dateModified: meta.published,
        inLanguage: 'en-IN',
        author: { '@type': 'Organization', name: 'ArtIntele.ai', url: `${SITE}/` },
        publisher: {
          '@type': 'Organization',
          name: 'ArtIntele.ai',
          url: `${SITE}/`,
          logo: { '@type': 'ImageObject', url: `${SITE}/assets/img/logo.png` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}${meta.url}` },
        isPartOf: { '@type': 'Blog', '@id': `${SITE}/blog#blog` },
      },
      breadcrumbs([
        ['Home', '/'],
        ['Blog', '/blog'],
        [a.heading, meta.url],
      ]),
    ],
    body: `<section class="section" style="padding-top:0;">
  <div class="container">
    <article class="post">
${indent(a.body, 6)}
      <p style="margin-top:40px;"><a class="btn btn-light" href="/blog">&larr; All notes</a></p>
    </article>
  </div>
</section>`,
  };
}

function breadcrumbs(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, url], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: `${SITE}${url}`,
    })),
  };
}

function indent(html, spaces) {
  const pad = ' '.repeat(spaces);
  return html
    .split('\n')
    .map((line) => (line.trim() ? pad + line.trim() : ''))
    .join('\n');
}

const SERVICES = [
  ['AI Voice Agents', 'Human-like AI voice agents handle inbound and outbound calls 24/7, so no lead or customer ever goes unanswered.'],
  ['AI Telecaller &amp; AI Receptionists', 'An always-on AI telecaller and receptionist that greets callers, qualifies leads, routes requests and books appointments &mdash; no hold music, no missed calls.'],
  ['Workflow Automation', 'Business process automation that connects your tools and runs the repetitive steps end to end, cutting manual work and costly errors.'],
  ['AI Chatbot Development', 'Conversational AI chatbots on your website and WhatsApp that qualify, support and convert visitors around the clock.'],
  ['Knowledge Assistants', 'Turn your documents and SOPs into a generative-AI assistant your team and customers can simply ask.'],
  ['AI Consulting', 'We map where AI pays off fastest and build the roadmap to get you there.'],
  ['Custom AI Software Development', 'Bespoke AI agents and integrations built around your exact processes &mdash; never a rigid template.'],
  ['Custom AI Voices', 'Branded, multilingual AI voices that sound like your business, in any language your customers speak &mdash; including regional Indian languages. Commonly deployed in English, Hindi, Kannada, Tamil, Telugu and Malayalam.'],
  ['WhatsApp Automation', 'Automated WhatsApp journeys, built on the official WhatsApp Business Platform, that qualify leads, send updates and reply instantly &mdash; at scale, around the clock.'],
  ['CRM Tools', 'Custom CRM setups and integrations that capture every lead and keep your follow-ups organised.'],
  ['Website Development &amp; SEO', 'High-performance websites engineered for SEO, AEO, GEO and GAIO &mdash; so you rank in search and surface in AI answers.'],
  ['Social Media Handling', 'End-to-end social media management &mdash; content, scheduling and engagement that keeps your brand active and growing.'],
];

const INDUSTRIES = [
  ['Healthcare', 'Appointment booking, reminder and reschedule calls, insurance workflows and patient support &mdash; so the front desk stops losing bookings to an engaged tone.'],
  ['Education', 'Admissions enquiries answered the minute they arrive, lead qualification across counsellors, fee reminders and student support.'],
  ['Real Estate', 'Every portal enquiry called back while the buyer is still looking, qualified on budget and locality, with site visits booked into the calendar.'],
  ['Manufacturing', 'Vendor communication, order and dispatch status, reporting and process tracking handled without pulling people off the floor.'],
  ['Finance', 'Document collection, KYC workflows, payment and renewal reminders, and customer support that runs inside your compliance rules.'],
  ['Retail &amp; E-commerce', 'Order confirmation, delivery and returns support, and customer engagement that keeps buyers informed without a bigger support team.'],
];

const PAGES = [
  // ---------------------------------------------------------------- services
  {
    file: 'services.html',
    url: '/services',
    title: 'AI Automation Services in India | ArtIntele.ai',
    description:
      'AI voice agents, telecallers, chatbots, WhatsApp and workflow automation — built around how your business already runs, and deployed end to end across India.',
    ogTitle: 'AI Automation Services — ArtIntele.ai',
    kicker: '/ Services',
    h1: 'AI Services Built Around <em>How You Already Work.</em>',
    sub: 'A full suite of AI and automation services. Every engagement is custom-built and deployed end to end — discovery, design, build, deployment, optimisation and maintenance.',
    schema: [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE}/services#page`,
        url: `${SITE}/services`,
        name: 'AI Automation Services in India',
        description:
          'AI voice agents, telecallers, chatbots, WhatsApp and workflow automation for businesses across India.',
        inLanguage: 'en-IN',
        isPartOf: { '@type': 'WebSite', url: `${SITE}/` },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: SERVICES.map(([name], i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'Service',
              name: name.replace(/&amp;/g, '&'),
              provider: { '@type': 'Organization', name: 'ArtIntele.ai' },
              areaServed: 'IN',
            },
          })),
        },
      },
      breadcrumbs([['Home', '/'], ['Services', '/services']]),
    ],
    body: `<section class="section">
  <div class="container">
    <div class="section-head" data-reveal>
      <span class="kicker">/ What we deliver</span>
      <h2 class="display">Everything Plugs Into How You Already Operate.</h2>
      <p>From AI voice agents and telecallers to chatbots, WhatsApp journeys, workflow automation and custom development &mdash; built for your processes, not a template.</p>
    </div>
    <div class="svc-grid">
${SERVICES.map(
  ([name, copy]) => `      <article class="ind" data-reveal>
        <h3>${name}</h3>
        <p>${copy}</p>
      </article>`
).join('\n')}
    </div>
    <div class="section-head" style="margin:56px auto 0;text-align:center;">
      <p><a class="btn btn-dark" href="/contact">Book a free consultation</a></p>
      <p>Not sure which of these you need? Start with <a href="/industries">what we build for your sector</a>, or see <a href="/pricing">how pricing works</a>.</p>
    </div>
  </div>
</section>`,
  },

  // -------------------------------------------------------------- industries
  {
    file: 'industries.html',
    url: '/industries',
    title: 'AI Automation by Industry in India | ArtIntele.ai',
    description:
      'How AI telecallers, voice agents and workflow automation are deployed in healthcare, education, real estate, manufacturing, finance and retail across India.',
    ogTitle: 'AI Automation by Industry — ArtIntele.ai',
    kicker: '/ Industries',
    h1: 'Solutions Shaped to <em>Your Sector.</em>',
    sub: 'Because every solution is custom-built, the same AI capabilities adapt to almost any industry. These are the sectors we deploy in most often.',
    schema: [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE}/industries#page`,
        url: `${SITE}/industries`,
        name: 'AI Automation by Industry in India',
        description:
          'AI voice agents and automation deployed across healthcare, education, real estate, manufacturing, finance and retail in India.',
        inLanguage: 'en-IN',
        isPartOf: { '@type': 'WebSite', url: `${SITE}/` },
      },
      breadcrumbs([['Home', '/'], ['Industries', '/industries']]),
    ],
    body: `<section class="section">
  <div class="container">
    <div class="section-head" data-reveal>
      <span class="kicker">/ Where we deploy</span>
      <h2 class="display">The Same Capabilities, Fitted to Your Sector.</h2>
      <p>Each of these runs on the same AI voice, chat and workflow layer &mdash; what changes is the script, the integrations and the compliance rules around them.</p>
    </div>
    <div class="ind-grid">
${INDUSTRIES.map(
  ([name, copy]) => `      <article class="ind" data-reveal>
        <h3>${name}</h3>
        <p>${copy}</p>
      </article>`
).join('\n')}
    </div>
    <div class="section-head" style="margin:56px auto 0;text-align:center;">
      <p><a class="btn btn-dark" href="/contact">Book a free consultation</a></p>
      <p>Every sector above runs on the same <a href="/services">core services</a>. If yours is not listed it is almost certainly still a fit &mdash; <a href="/contact">tell us the workflow</a>.</p>
    </div>
  </div>
</section>`,
  },

  // ------------------------------------------------------------- blog posts
  articlePage('voice-ai-2026', {
    file: 'blog-voice-ai-in-production-2026.html',
    url: '/blog/voice-ai-in-production-2026',
    title: 'Voice AI in Production: What Works in 2026 | ArtIntele.ai',
    description:
      'Latency budgets, barge-in and mid-call language switching — the engineering that separates a voice AI demo from a deployment that answers real calls.',
    kicker: 'Voice AI &middot; July 2026',
    sub: 'What separates a great voice AI demo from a great deployment is never the model. It is everything around it.',
    published: '2026-07-15',
  }),

  articlePage('whatsapp-playbook', {
    file: 'blog-whatsapp-automation-playbook.html',
    url: '/blog/whatsapp-automation-playbook',
    title: 'WhatsApp Automation Playbook for Business | ArtIntele.ai',
    description:
      'Opt-in flows, the 24-hour service window and message templates — how to automate WhatsApp at scale on the official Business Platform without getting banned.',
    kicker: 'WhatsApp &middot; July 2026',
    sub: 'WhatsApp is where your customers already are, which is why it is regulated more tightly than any other channel. The rules are simpler than they look.',
    published: '2026-07-08',
  }),

  articlePage('chatbots-to-agents', {
    file: 'blog-from-chatbots-to-agents.html',
    url: '/blog/from-chatbots-to-agents',
    title: 'From Chatbots to Agents That Finish the Job | ArtIntele.ai',
    description:
      'A chatbot answers questions; an agent completes the task. What it takes to trust an AI agent with your CRM, calendar and payments — and where to start.',
    kicker: 'Agentic AI &middot; June 2026',
    sub: 'The difference between answering a question and completing a task sounds small. It changes everything.',
    published: '2026-06-24',
  }),

  articlePage('five-workflows', {
    file: 'blog-five-workflows-to-automate.html',
    url: '/blog/five-workflows-to-automate',
    title: 'Five Workflows to Automate Before You Hire | ArtIntele.ai',
    description:
      'Lead follow-up, appointment reminders, document intake, status updates and FAQ handling — the five automations that pay back fastest, before the next ops hire.',
    kicker: 'Operations &middot; June 2026',
    sub: 'Most ops workloads are a handful of repetitive loops. Automating them costs a fraction of a salary and never resigns.',
    published: '2026-06-10',
  }),

  // Long-form pages carry their own copy and schema in scripts/content/.
  require('./content/ai-cold-calling-rules-india.js'),
  require('./content/top-ai-voice-agents-india.js'),
  require('./content/ai-telecaller-bangalore.js'),
];

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
function render(page) {
  const og = page.ogTitle || page.title.split(' | ')[0];
  const graph = JSON.stringify(
    { '@context': 'https://schema.org', '@graph': page.schema },
    null,
    2
  );

  const head = `<title>${page.title}</title>
<meta name="description" content="${page.description}">
<meta name="theme-color" content="#1f9d5b">
<meta property="og:type" content="${page.url.startsWith('/blog/') ? 'article' : 'website'}">
<meta property="og:site_name" content="ArtIntele.ai">
<meta property="og:url" content="${SITE}${page.url}">
<meta property="og:title" content="${og}">
<meta property="og:description" content="${page.description}">
<meta property="og:image" content="${SITE}/assets/img/og-image.png?v=${ASSET_V}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${og}">
<meta name="twitter:description" content="${page.description}">
<meta name="twitter:image" content="${SITE}/assets/img/og-image.png?v=${ASSET_V}">
<link rel="canonical" href="${SITE}${page.url}">
<link id="favicon" rel="icon" type="image/png" href="/assets/img/logo.png?v=${ASSET_V}">
<link rel="apple-touch-icon" href="/assets/img/logo.png?v=${ASSET_V}">
<script type="application/ld+json">
${graph}
</script>
`;

  // layout: 'legal' pages own their <h1> inside <main class="legal">, which is
  // the long-form treatment used by /privacy and /terms — it styles h2, ul,
  // tables and inline links, none of which the hero layout provides. They get
  // no aurora header.
  const header =
    page.layout === 'legal'
      ? ''
      : `
<div class="page-wrap">
  <header class="page-head">
    <div class="hero-aurora"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span><span class="blob b4"></span><span class="blob b5"></span><span class="blob bi"></span></div>
    <div class="hero-inner-z">
      <span class="kicker">${page.kicker}</span>
      <h1>${page.h1}</h1>
    </div>
    <p class="sub">${page.sub}</p>
  </header>
</div>
`;

  return (
    HEAD_OPEN + head + HEAD_ASSETS + '\n' + BODY_OPEN + '\n' + header + '\n' +
    page.body + '\n\n' + FOOTER
  );
}

let written = 0;
for (const page of PAGES) {
  fs.writeFileSync(path.join(FRONTEND, page.file), render(page), 'utf8');
  console.log(`  ${page.url.padEnd(38)} -> frontend/${page.file}`);
  written++;
}
console.log(`\n${written} pages generated.`);

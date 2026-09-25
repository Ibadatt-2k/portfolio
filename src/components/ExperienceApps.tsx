import { useState, type ReactNode } from 'react'

// The companies I work for, shown as app icons under Experience; each opens
// its own window. Sizes are for the 1280px-wide page on the laptop's display.

export type App = {
  name: string
  icon: string
  /** The window's width (a Tailwind class) and what it shows. */
  window: { className: string; content: ReactNode }
}

type Role = {
  title: string
  kind?: string
  dates: string
  stats: { value: string; label: string }[]
  /** Each highlight's outcome (shown bold), then how it was done. */
  highlights: [outcome: string, how: string][]
  stack: string[]
}

// Newest first.
const OBJECTBRIGHT: Role[] = [
  {
    title: 'AI & DevOps Engineer',
    kind: 'Full-Time',
    dates: 'Nov 2025 – Present',
    stats: [
      { value: 'Near-zero', label: 'hallucinated answers' },
      { value: '2', label: 'LLM backends, one pipeline' },
      { value: 'Real-time', label: 'chat over WebSockets' },
    ],
    highlights: [
      [
        'Cut hallucinated, untraceable answers to near-zero',
        ' by building and deploying a production RAG system that chunks and embeds the full company document corpus into a Qdrant vector database, constraining every response to indexed source material.',
      ],
      [
        'Enabled swapping and benchmarking LLM backends without rewriting the application layer',
        ' by integrating Gemma 3 and Codex behind a shared retrieval pipeline.',
      ],
      [
        'Delivered real-time responses to end users',
        ' by building a WebSocket interface and deploying LibreChat as the production chat front end for the company’s self-hosted models.',
      ],
      [
        'Maintained uninterrupted production service',
        ' by owning release management (PR review and merge on the production branch) and administering the self-hosted Linux server over SSH, including proactive SSL/TLS certificate renewals.',
      ],
      [
        'Kept containerized deployments stable',
        ' by troubleshooting and resolving recurring Node.js dependency issues across Dockerized production services.',
      ],
    ],
    stack: ['RAG', 'Qdrant', 'Gemma 3', 'Codex', 'WebSockets', 'LibreChat', 'Docker', 'Node.js', 'Linux', 'SSH', 'SSL/TLS'],
  },
  {
    title: 'Systems Administrator',
    dates: 'Apr 2025 – Jun 2025',
    stats: [
      { value: '9', label: 'VMs moved off VMware' },
      { value: '~30', label: 'workstations on Group Policy' },
      { value: '2', label: 'servers racked' },
    ],
    highlights: [
      [
        'Eliminated our recurring VMware licensing cost',
        ' by helping migrate 9 production VMs to a self-hosted Proxmox VE server, transferring disks over NFS and verifying each guest booted and services came back cleanly. Completed in a single weekend maintenance window.',
      ],
      [
        'Installed 2 new servers at a data centre',
        ', racking, cabling and commissioning the hardware alongside the senior admin, adding capacity without expanding our hosted footprint.',
      ],
      [
        'Cut account setup from a per-machine task to one directory change',
        ' by configuring Active Directory and Group Policy for roughly 30 domain-joined workstations, so access could be granted or revoked centrally and immediately.',
      ],
      [
        'Separated production, staff and guest traffic',
        ' by configuring inter-VLAN routing, and resolved recurring connectivity complaints by tracing faults through switching, routing and firewall rules rather than restarting equipment.',
      ],
      [
        'Kept production sites online with no expiry-related downtime',
        ' by managing DNS records and renewing SSL/TLS certificates ahead of schedule.',
      ],
      [
        'Closed off password-based access to production servers',
        ' by moving SSH to key-based authentication with a restricted login policy.',
      ],
    ],
    stack: ['Proxmox VE', 'VMware', 'NFS', 'Active Directory', 'Group Policy', 'VLANs', 'DNS', 'SSL/TLS', 'SSH'],
  },
  {
    title: 'Software Engineer',
    kind: 'Co-op',
    dates: 'May 2024 – Aug 2024',
    stats: [
      { value: '30–50k', label: 'documents parsed' },
      { value: '~20 min', label: 'to parse them all' },
      { value: 'Near-zero', label: 'numerical error' },
    ],
    highlights: [
      [
        'Eliminated a recurring third-party software license',
        ' by building a Python extraction pipeline that parsed 30,000–50,000 unstructured insurance documents in ~20 minutes with near-zero numerical error.',
      ],
      [
        'Turned scanned policy documents into analysis-ready datasets',
        ' for SQL-backed commission and premium calculations by combining Tesseract OCR, pdfplumber, PyPDF2, BeautifulSoup, and custom regex parsers with pandas normalization.',
      ],
      [
        'Delivered secure client-data storage across multiple company websites',
        ' by building client-facing web features in PHP/Laravel backed by SQL data models.',
      ],
    ],
    stack: ['Python', 'Tesseract OCR', 'pdfplumber', 'PyPDF2', 'BeautifulSoup', 'Regex', 'pandas', 'SQL', 'PHP', 'Laravel'],
  },
]

/** A Settings-style window: roles down a sidebar, the chosen one's details beside it. */
function ObjectBright() {
  const [selected, setSelected] = useState(0)
  const role = OBJECTBRIGHT[selected]

  return (
    <div className="flex h-[680px] @max-3xl:h-[calc(100cqh-72px)] @max-3xl:flex-col">
      <nav aria-label="Roles at ObjectBright" className="w-[330px] shrink-0 border-r border-white/8 bg-[#252528] p-6 @max-3xl:w-auto @max-3xl:border-r-0 @max-3xl:border-b @max-3xl:p-2">
        <div className="flex items-center gap-4 px-3 pb-8 @max-3xl:hidden">
          <img src="/apps/objectbright.webp" alt="" className="size-16 rounded-[22%]" />
          <div>
            <p className="text-2xl font-bold">ObjectBright</p>
            <p className="text-lg text-white/50">May 2024 – Present</p>
          </div>
        </div>
        {/* A timeline: a line through each role's dot, newest at the top. */}
        <ol className="relative flex flex-col gap-2 before:absolute before:top-8 before:bottom-8 before:left-[27px] before:w-0.5 before:bg-white/12 @max-3xl:flex-row @max-3xl:gap-1 @max-3xl:overflow-x-auto @max-3xl:[scrollbar-width:none] @max-3xl:before:hidden">
          {OBJECTBRIGHT.map((r, i) => (
            <li key={r.title}>
              <button
                type="button"
                aria-current={i === selected}
                onClick={() => setSelected(i)}
                className={`relative flex w-full cursor-pointer gap-5 rounded-2xl py-4 pr-4 pl-5 text-left transition-colors @max-3xl:gap-0 @max-3xl:rounded-xl @max-3xl:px-3 @max-3xl:py-2 @max-3xl:whitespace-nowrap ${i === selected ? 'bg-white/12' : 'hover:bg-white/6'}`}
              >
                <span
                  className={`mt-2 size-3.5 shrink-0 rounded-full ring-4 ring-[#252528] @max-3xl:hidden ${i === selected ? 'bg-white' : 'bg-white/35'}`}
                />
                <span>
                  <span className="block text-xl font-semibold @max-3xl:text-sm">{r.title}</span>
                  <span className="block text-base text-white/50 @max-3xl:text-[11px]">{r.dates}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* Scrolls on its own (MacWindow keeps that from scrolling the page);
          keyed so each role opens at its top. */}
      <article key={selected} className="min-w-0 flex-1 overflow-y-auto p-12 @max-3xl:p-5 [scrollbar-color:rgb(255_255_255/0.2)_transparent] [scrollbar-width:thin]">
        <p className="text-lg font-medium tracking-[0.18em] text-white/45 uppercase @max-3xl:text-[10px]">
          {[role.kind, role.dates].filter(Boolean).join(' · ')}
        </p>
        <h4 className="mt-2 text-5xl font-extrabold tracking-[-0.03em] @max-3xl:text-2xl">{role.title}</h4>

        <dl className="mt-8 grid grid-cols-3 gap-4 @max-3xl:mt-4 @max-3xl:gap-2">
          {role.stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col-reverse gap-1 rounded-2xl bg-white/6 px-6 py-5 @max-3xl:rounded-xl @max-3xl:px-2.5 @max-3xl:py-2">
              <dt className="text-lg text-white/55 @max-3xl:text-[10px] @max-3xl:leading-tight">{label}</dt>
              <dd className="text-4xl font-extrabold tracking-[-0.02em] @max-3xl:text-base">{value}</dd>
            </div>
          ))}
        </dl>

        <ul className="mt-10 flex flex-col gap-6 @max-3xl:mt-5 @max-3xl:gap-3">
          {role.highlights.map(([outcome, how]) => (
            <li key={outcome} className="flex gap-4 text-[26px] leading-snug text-white/60 @max-3xl:gap-2.5 @max-3xl:text-sm">
              <span aria-hidden className="mt-3.5 size-2 shrink-0 rounded-full bg-white/40 @max-3xl:mt-1.5 @max-3xl:size-1.5" />
              <p>
                <strong className="font-semibold text-white">{outcome}</strong>
                {how}
              </p>
            </li>
          ))}
        </ul>

        <h5 className="mt-12 text-lg font-medium tracking-[0.18em] text-white/45 uppercase @max-3xl:mt-6 @max-3xl:text-[10px]">Stack</h5>
        <ul className="mt-4 flex flex-wrap gap-3 @max-3xl:mt-2 @max-3xl:gap-1.5">
          {role.stack.map((tool) => (
            <li key={tool} className="rounded-full border border-white/12 bg-white/6 px-5 py-2 text-xl text-white/80 @max-3xl:px-2.5 @max-3xl:py-1 @max-3xl:text-xs">
              {tool}
            </li>
          ))}
        </ul>
      </article>
    </div>
  )
}

function Mercor() {
  return (
    <div className="flex gap-10 p-12 @max-3xl:flex-col @max-3xl:gap-4 @max-3xl:p-6">
      <img src="/apps/mercor.webp" alt="" className="size-28 shrink-0 rounded-[22%] @max-3xl:size-16" />
      <div>
        <p className="text-2xl font-medium tracking-[0.2em] text-white/45 uppercase @max-3xl:text-xs">Mercor</p>
        <h4 className="mt-2 text-6xl font-extrabold tracking-[-0.03em] @max-3xl:text-3xl">Generalist AI Expert</h4>
        <p className="mt-6 text-3xl leading-snug text-white/75 @max-3xl:mt-3 @max-3xl:text-base">
          I worked as a generalist AI expert, reviewing AI models and their accuracy and providing
          detailed feedback.
        </p>
      </div>
    </div>
  )
}

export const APPS: App[] = [
  {
    name: 'ObjectBright',
    icon: '/apps/objectbright.webp',
    window: { className: 'w-[1160px] @max-3xl:w-[calc(100%-16px)]', content: <ObjectBright /> },
  },
  {
    name: 'Mercor',
    icon: '/apps/mercor.webp',
    window: { className: 'w-[880px] @max-3xl:w-[calc(100%-16px)]', content: <Mercor /> },
  },
]

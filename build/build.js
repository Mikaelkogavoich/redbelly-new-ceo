'use strict';
// Generates every deliverable from content.js:
//   01-briefing/new-ceo-briefing.{docx,md}
//   02-x-thread/x-thread.{md,txt}
//   03-source-list/source-list.{docx,md}
// PDFs are produced from the .docx files by build.sh (LibreOffice).

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, LevelFormat, Header, Footer,
  PageNumber, PageOrientation, PositionalTab, PositionalTabAlignment, PositionalTabRelativeTo,
  PositionalTabLeader, Tab, TabStopType,
} = require('docx');
const { ACCESSED, SOURCES, CLAIMS, BRIEFING, THREAD } = require('./content');

const ROOT = path.resolve(__dirname, '..');
const OUT = {
  briefingDocx: path.join(ROOT, '01-briefing', 'new-ceo-briefing.docx'),
  briefingMd: path.join(ROOT, '01-briefing', 'new-ceo-briefing.md'),
  threadMd: path.join(ROOT, '02-x-thread', 'x-thread.md'),
  threadTxt: path.join(ROOT, '02-x-thread', 'x-thread.txt'),
  sourcesDocx: path.join(ROOT, '03-source-list', 'source-list.docx'),
  sourcesMd: path.join(ROOT, '03-source-list', 'source-list.md'),
};

// ---------------------------------------------------------------- parsing + validation

const TOKEN_RE = /\[\[([a-z0-9-]+):(S\d+(?:,S\d+)*)\]\]|\*\*(.+?)\*\*|_(.+?)_/g;

function tokenize(text) {
  const out = [];
  let last = 0;
  let m;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(text))) {
    if (m.index > last) out.push({ t: 'text', v: text.slice(last, m.index) });
    if (m[1]) out.push({ t: 'cite', claim: m[1], sources: m[2].split(',') });
    else if (m[3]) out.push({ t: 'bold', v: m[3] });
    else out.push({ t: 'italic', v: m[4] });
    last = TOKEN_RE.lastIndex;
  }
  if (last < text.length) out.push({ t: 'text', v: text.slice(last) });
  return out;
}

const errors = [];
const claimOrder = []; // claim keys in order of first appearance in the briefing
const claimSections = {}; // claim key -> section heading where it first appears

function visit(text, section) {
  for (const tok of tokenize(text)) {
    if (tok.t !== 'cite') continue;
    const claim = CLAIMS[tok.claim];
    if (!claim) { errors.push(`Unknown claim "${tok.claim}"`); continue; }
    const want = Object.keys(claim.ev).sort().join(',');
    const got = [...tok.sources].sort().join(',');
    if (want !== got) errors.push(`Claim "${tok.claim}" cites ${got} but its evidence covers ${want}`);
    for (const s of tok.sources) if (!SOURCES[s]) errors.push(`Unknown source ${s} in "${tok.claim}"`);
    if (!claimOrder.includes(tok.claim)) { claimOrder.push(tok.claim); claimSections[tok.claim] = section; }
  }
}

function walkBriefing(fn) {
  for (const sec of BRIEFING.sections) {
    if (sec.intro) fn(sec.intro, sec.h1);
    for (const b of sec.blocks || []) {
      if (b.p) fn(b.p, sec.h1);
      if (b.analysis) b.analysis.forEach((t) => fn(t, sec.h1));
      if (b.bullets) b.bullets.forEach((t) => fn(t, sec.h1));
      if (b.glossary) b.glossary.forEach(([, t]) => fn(t, sec.h1));
    }
    for (const pt of sec.points || []) { fn(pt.basis, sec.h1); fn(pt.analysis, sec.h1); }
  }
}

walkBriefing(visit);
for (const key of Object.keys(CLAIMS)) if (!claimOrder.includes(key)) errors.push(`Claim "${key}" is never cited`);
for (const [i, post] of THREAD.entries()) {
  for (const c of post.claims) if (!CLAIMS[c]) errors.push(`Thread post ${i + 1}: unknown claim "${c}"`);
  for (const s of post.sources) if (!SOURCES[s]) errors.push(`Thread post ${i + 1}: unknown source ${s}`);
  for (const c of post.claims) {
    if (CLAIMS[c] && !post.sources.some((s) => CLAIMS[c].ev[s])) {
      errors.push(`Thread post ${i + 1}: claim "${c}" has no evidence from the sources linked in the post`);
    }
  }
}
const usedSources = new Set();
for (const c of Object.values(CLAIMS)) Object.keys(c.ev).forEach((s) => usedSources.add(s));
for (const s of Object.keys(SOURCES)) if (!usedSources.has(s)) errors.push(`Source ${s} is never used`);
if (errors.length) {
  console.error('Build stopped: content validation failed\n - ' + errors.join('\n - '));
  process.exit(1);
}

const claimNo = (key) => 'C' + String(claimOrder.indexOf(key) + 1).padStart(2, '0');

// X counts every URL as 23 characters and most CJK/emoji as 2 (twitter-text v3 weighting).
function xLength(text) {
  const withoutUrls = text.replace(/https?:\/\/\S+/g, '');
  const urls = (text.match(/https?:\/\/\S+/g) || []).length;
  let n = 0;
  for (const ch of withoutUrls) {
    const cp = ch.codePointAt(0);
    const light = cp <= 4351 || (cp >= 8192 && cp <= 8205) || (cp >= 8208 && cp <= 8223) || (cp >= 8242 && cp <= 8247);
    n += light ? 1 : 2;
  }
  return n + urls * 23;
}

const threadPosts = THREAD.map((post, i) => {
  const body = `${i + 1}/${THREAD.length} ${post.text}\n\n${post.sources.map((s) => SOURCES[s].url).join('\n')}`;
  return { ...post, body, length: xLength(body) };
});
for (const [i, p] of threadPosts.entries()) {
  if (p.length > 280) errors.push(`Thread post ${i + 1} is ${p.length} characters (limit 280)`);
}
if (errors.length) {
  console.error('Build stopped:\n - ' + errors.join('\n - '));
  process.exit(1);
}

// ---------------------------------------------------------------- DOCX helpers

const FONT = 'Calibri';
const C = {
  ink: '1F2328', muted: '5B6470', accent: '8E1B2C', cite: '8E1B2C',
  bar: 'B7791F', fill: 'FBF5E6', label: '7A4E0E', rule: 'D5D9DE', termFill: 'F2F3F5', basisFill: 'F6F7F9',
};
const SIZE = { body: 21, small: 17, cite: 15, h1: 25, h2: 21, title: 38, subtitle: 23, kicker: 16 };

function citeRuns(ids) {
  const r = [new TextRun({ text: '[', size: SIZE.cite, color: C.cite })];
  ids.forEach((id, i) => {
    if (i) r.push(new TextRun({ text: ' · ', size: SIZE.cite, color: C.cite }));
    r.push(new ExternalHyperlink({
      link: SOURCES[id].url,
      children: [new TextRun({ text: SOURCES[id].label, size: SIZE.cite, color: C.cite, underline: {} })],
    }));
  });
  r.push(new TextRun({ text: ']', size: SIZE.cite, color: C.cite }));
  return r;
}

function runs(text, base = {}) {
  const out = [];
  for (const tok of tokenize(text)) {
    if (tok.t === 'text') out.push(new TextRun({ text: tok.v, ...base }));
    else if (tok.t === 'bold') out.push(new TextRun({ text: tok.v, ...base, bold: true }));
    else if (tok.t === 'italic') out.push(new TextRun({ text: tok.v, ...base, italics: true }));
    else out.push(...citeRuns(tok.sources));
  }
  return out;
}

const para = (text, opts = {}) => new Paragraph({ children: runs(text, opts.run), ...opts.p });
const h1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
const h2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
const bullet = (text) => new Paragraph({ numbering: { reference: 'bullet', level: 0 }, spacing: { after: 70 }, children: runs(text) });

const ANALYSIS_BOX = {
  shading: { type: ShadingType.CLEAR, color: 'auto', fill: C.fill },
  border: { left: { style: BorderStyle.SINGLE, size: 18, color: C.bar, space: 8 } },
  indent: { left: 170, right: 113 },
};

function analysisPara(text, label) {
  return new Paragraph({
    ...ANALYSIS_BOX,
    spacing: { before: 40, after: 120 },
    children: [
      new TextRun({ text: label, bold: true, size: SIZE.cite + 1, color: C.label, characterSpacing: 10 }),
      new TextRun({ text: '  ' }),
      ...runs(text),
    ],
  });
}

function basisPara(text) {
  return new Paragraph({
    spacing: { before: 20, after: 50 },
    children: [new TextRun({ text: 'Basis (facts): ', bold: true }), ...runs(text)],
  });
}

const thin = { style: BorderStyle.SINGLE, size: 4, color: C.rule };
const CELL_BORDERS = { top: thin, bottom: thin, left: thin, right: thin };

function cell(children, width, opts = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: CELL_BORDERS,
    margins: { top: 50, bottom: 50, left: 90, right: 90 },
    shading: opts.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: opts.fill } : undefined,
    columnSpan: opts.span,
    children,
  });
}

function table(widths, rows) {
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths,
    rows,
  });
}

function docStyles() {
  return {
    default: {
      document: {
        run: { font: FONT, size: SIZE.body, color: C.ink },
        paragraph: { spacing: { after: 100, line: 259 } },
      },
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FONT, size: SIZE.h1, bold: true, color: C.accent },
        paragraph: {
          spacing: { before: 220, after: 70 }, keepNext: true, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.rule, space: 2 } },
        },
      },
      {
        id: 'Furniture', name: 'Header Footer Small', basedOn: 'Normal', quickFormat: false,
        run: { font: FONT, size: SIZE.small - 1, color: C.muted },
        paragraph: { spacing: { after: 0 } },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FONT, size: SIZE.h2, bold: true, color: C.ink },
        paragraph: { spacing: { before: 120, after: 40 }, keepNext: true, outlineLevel: 1 },
      },
    ],
  };
}

const NUMBERING = {
  config: [{
    reference: 'bullet',
    levels: [{
      level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 284, hanging: 198 } } },
    }],
  }],
};

function headerFooter(headerText, footerText, contentWidth, { blankFirstHeader = false } = {}) {
  const small = { size: SIZE.small - 1, color: C.muted };
  const header = new Header({
    children: [new Paragraph({ style: 'Furniture', alignment: AlignmentType.RIGHT, children: [new TextRun({ text: headerText, ...small })] })],
  });
  const footer = () => new Footer({
    children: [new Paragraph({
      style: 'Furniture',
      tabStops: [{ type: TabStopType.RIGHT, position: contentWidth }],
      children: [
        new TextRun({ text: footerText, ...small }),
        new TextRun({ ...small, children: [new Tab(), 'Page '] }),
        new TextRun({ ...small, children: [PageNumber.CURRENT] }),
        new TextRun({ ...small, text: ' of ' }),
        new TextRun({ ...small, children: [PageNumber.TOTAL_PAGES] }),
      ],
    })],
  });
  const out = { headers: { default: header }, footers: { default: footer() } };
  if (blankFirstHeader) {
    out.headers.first = new Header({ children: [new Paragraph({ children: [] })] });
    out.footers.first = footer();
  }
  return out;
}

const DOC_META = { creator: 'Redbelly DAO TASK-28', lastModifiedBy: 'Redbelly DAO TASK-28' };

// ---------------------------------------------------------------- briefing (DOCX)

function buildBriefingDocx() {
  const A4 = { width: 11906, height: 16838 };
  const margin = { top: 964, bottom: 907, left: 1077, right: 1077, header: 482, footer: 482 };
  const contentWidth = A4.width - margin.left - margin.right;
  const children = [];

  children.push(new Paragraph({
    spacing: { after: 110 },
    children: [new TextRun({ text: BRIEFING.kicker.toUpperCase(), bold: true, size: SIZE.kicker, color: C.accent, characterSpacing: 20 })],
  }));
  children.push(new Paragraph({
    spacing: { after: 50 },
    children: [new TextRun({ text: BRIEFING.title, bold: true, size: SIZE.title, color: C.ink })],
  }));
  children.push(new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: BRIEFING.subtitle, size: SIZE.subtitle, color: C.muted })],
  }));
  children.push(new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text: BRIEFING.meta, size: SIZE.small, color: C.muted })],
  }));
  children.push(new Paragraph({
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: C.basisFill },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: C.rule, space: 8 } },
    indent: { left: 170, right: 113 },
    spacing: { after: 60 },
    children: [new TextRun({ text: BRIEFING.howto, size: SIZE.small, italics: true, color: C.muted })],
  }));

  for (const sec of BRIEFING.sections) {
    children.push(h1(sec.h1));
    if (sec.intro) {
      children.push(new Paragraph({ spacing: { after: 60 }, children: runs(sec.intro, { italics: true, color: C.muted, size: SIZE.small + 1 }) }));
    }
    for (const b of sec.blocks || []) {
      if (b.p) children.push(para(b.p, { p: { alignment: AlignmentType.LEFT } }));
      if (b.h2) children.push(h2(b.h2));
      if (b.bullets) b.bullets.forEach((t) => children.push(bullet(t)));
      if (b.analysis) b.analysis.forEach((t) => children.push(analysisPara(t, 'ANALYSIS · IN BRIEF')));
      if (b.glossary) {
        const w = [1500, contentWidth - 1500];
        children.push(table(w, b.glossary.map(([term, text]) => new TableRow({
          children: [
            cell([new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: term, bold: true, size: SIZE.small + 1 })] })], w[0], { fill: C.termFill }),
            cell([new Paragraph({ spacing: { after: 0 }, children: runs(text, { size: SIZE.small + 1 }) })], w[1]),
          ],
        }))));
      }
    }
    for (const pt of sec.points || []) {
      children.push(h2(pt.h2));
      children.push(basisPara(pt.basis));
      children.push(analysisPara(pt.analysis, 'ANALYSIS'));
    }
  }

  return new Document({
    ...DOC_META,
    title: `${BRIEFING.title}: briefing`,
    description: BRIEFING.subtitle,
    styles: docStyles(),
    numbering: NUMBERING,
    sections: [{
      properties: { titlePage: true, page: { size: A4, margin } },
      ...headerFooter(`${BRIEFING.kicker} · ${ACCESSED}`, BRIEFING.footer, contentWidth, { blankFirstHeader: true }),
      children,
    }],
  });
}

// ---------------------------------------------------------------- source list (DOCX)

const SECTION_ORDER = BRIEFING.sections.map((s) => s.h1);

function claimsBySection() {
  return SECTION_ORDER.map((h) => ({ heading: h, keys: claimOrder.filter((k) => claimSections[k] === h) }));
}

function sourceLink(id, size) {
  return new ExternalHyperlink({
    link: SOURCES[id].url,
    children: [new TextRun({ text: id, size, color: C.cite, underline: {}, bold: true })],
  });
}

function buildSourcesDocx() {
  const page = { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE };
  const margin = { top: 907, bottom: 850, left: 1020, right: 1020, header: 454, footer: 454 };
  const contentWidth = 16838 - margin.left - margin.right;
  const sz = SIZE.small;
  const P = (children, extra = {}) => new Paragraph({ spacing: { after: 0, line: 240 }, children, ...extra });
  const T = (text, o = {}) => new TextRun({ text, size: sz, ...o });
  const children = [];

  children.push(new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: 'REDBELLY DAO · NEW CEO BRIEFING', bold: true, size: SIZE.kicker, color: C.accent, characterSpacing: 20 })] }));
  children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: 'Source list: every factual claim and its source', bold: true, size: 32 })] }));
  children.push(new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({
      text: `Covers the briefing and the X thread on Christian Westerlind Wigstrom. All sources accessed ${ACCESSED}. Claim numbers (C01…) follow the order in which claims first appear in the briefing. “Task resource” = listed in the task brief; “Supplementary” = additional public record, used only where the task resources do not cover a fact.`,
      size: sz + 1, color: C.muted,
    })],
  }));

  // A. Sources
  children.push(h1('A. Sources'));
  const wA = [700, 4300, 1900, 4970, 0];
  wA[4] = contentWidth - wA.slice(0, 4).reduce((a, b) => a + b, 0);
  const headRow = (labels, widths) => new TableRow({
    tableHeader: true,
    children: labels.map((l, i) => cell([P([T(l, { bold: true })])], widths[i], { fill: C.termFill })),
  });
  children.push(table(wA, [
    headRow(['ID', 'Source', 'Type', 'Link', 'Access notes'], wA),
    ...Object.entries(SOURCES).map(([id, s]) => new TableRow({
      cantSplit: true,
      children: [
        cell([P([sourceLink(id, sz)])], wA[0]),
        cell([P([T(s.title, { bold: true })]), P([T(`${s.publisher}${s.date !== 'n/a' ? ` · ${s.date}` : ''}`, { color: C.muted })])], wA[1]),
        cell([P([T(s.tier)])], wA[2]),
        cell([P([new ExternalHyperlink({ link: s.url, children: [T(s.url, { color: C.cite, underline: {}, size: sz - 1 })] })])], wA[3]),
        cell([P([T(s.note || '—', { color: C.muted })])], wA[4]),
      ],
    })),
  ]));

  // B. Claim map
  children.push(h1('B. Claim map: briefing'));
  const wB = [700, 4600, 1000, 0];
  wB[3] = contentWidth - wB.slice(0, 3).reduce((a, b) => a + b, 0);
  const rowsB = [headRow(['#', 'Claim as stated in the briefing', 'Source', 'Supporting excerpt (verbatim; … marks omitted text)'], wB)];
  for (const group of claimsBySection()) {
    rowsB.push(new TableRow({
      cantSplit: true,
      children: [cell([P([T(group.heading, { bold: true, color: C.accent })])], contentWidth, { span: 4, fill: C.basisFill })],
    }));
    for (const key of group.keys) {
      const cl = CLAIMS[key];
      const ids = Object.keys(cl.ev);
      rowsB.push(new TableRow({
        cantSplit: true,
        children: [
          cell([P([T(claimNo(key), { bold: true })])], wB[0]),
          cell([P([T(cl.text)])], wB[1]),
          cell(ids.map((id) => P([sourceLink(id, sz)])), wB[2]),
          cell(ids.map((id) => P([T(`${id}: `, { bold: true, color: C.muted }), T(`“${cl.ev[id]}”`, { italics: true })])), wB[3]),
        ],
      }));
    }
  }
  children.push(table(wB, rowsB));

  // C. Thread map
  children.push(h1('C. Claim map: X thread'));
  const wC = [800, 7200, 2000, 0];
  wC[3] = contentWidth - wC.slice(0, 3).reduce((a, b) => a + b, 0);
  children.push(table(wC, [
    headRow(['Post', 'Post text (without links)', 'Claims', 'Link(s) in the post'], wC),
    ...threadPosts.map((p, i) => new TableRow({
      cantSplit: true,
      children: [
        cell([P([T(`${i + 1}/${THREAD.length}`, { bold: true })])], wC[0]),
        cell(p.text.split('\n').filter(Boolean).map((line) => P([T(line)])), wC[1]),
        cell([P([T(p.claims.map(claimNo).join(', '))])], wC[2]),
        cell(p.sources.map((id) => P([sourceLink(id, sz), T(`  ${SOURCES[id].label}`, { color: C.muted })])), wC[3]),
      ],
    })),
  ]));

  // D. Verification notes
  children.push(h1('D. Verification notes'));
  for (const note of VERIFICATION_NOTES) children.push(new Paragraph({ numbering: { reference: 'bullet', level: 0 }, spacing: { after: 50 }, children: runs(note, { size: sz + 1 }) }));

  return new Document({
    ...DOC_META,
    title: 'Source list: New CEO briefing',
    styles: docStyles(),
    numbering: NUMBERING,
    sections: [{
      properties: { page: { size: page, margin } },
      ...headerFooter(`Source list · ${BRIEFING.kicker}`, `Sources accessed ${ACCESSED}`, contentWidth),
      children,
    }],
  });
}

const VERIFICATION_NOTES = [
  '**Method.** Each source was opened and read on the access date. Every claim was checked against the excerpt quoted in section B, and every quotation in the briefing and the thread appears verbatim in those excerpts. Quotes attributed to Christian Westerlind Wigstrom come only from S1/S2 (the announcement), S12 (Monoova interview) and S13 (AP+ case study).',
  '**Monoova end date.** S4 says he was CEO “until July this year” (2026); the About line on S5 says “until May 2026”. The briefing therefore states only “until 2026”.',
  '**PhD field.** S15 gives the field as International Relations; S17 describes it as African trade politics. The briefing states only that he holds a PhD from Oxford.',
  '**Paywall and logged-out views.** S4 is partly paywalled; only its free portion is cited. S5 was read logged out; Experience titles are hidden in that view, so the briefing relies on S5 only for the About line, the Education entry and his own posts listing board roles.',
  '**Automated link checks.** S5 (LinkedIn) refuses scripted requests (HTTP 999) but opens normally in a browser; it was read logged out. The other sources returned HTTP 200 on the access date (see verification/verification-report.md).',
  '**Exclusions.** Some sources include personal background outside the professional record (place of birth, pre-career service, relocation, personal style). These were deliberately left out.',
  '**Company-reported figures.** Monoova figures come from Redbelly’s announcement and Tokeniser figures from Tokeniser’s own site; the briefing attributes them accordingly and does not present them as independently audited.',
];

// ---------------------------------------------------------------- Markdown outputs

function mdInline(text) {
  return tokenize(text).map((tok) => {
    if (tok.t === 'text') return tok.v;
    if (tok.t === 'bold') return `**${tok.v}**`;
    if (tok.t === 'italic') return `_${tok.v}_`;
    return '\\[' + tok.sources.map((id) => `[${SOURCES[id].label}](${SOURCES[id].url})`).join(' · ') + '\\]';
  }).join('');
}

function buildBriefingMd() {
  const L = [];
  L.push(`# ${BRIEFING.title}`, '', `**${BRIEFING.subtitle}**`, '', `_${BRIEFING.kicker} · ${BRIEFING.meta}_`, '');
  const howto = BRIEFING.howto
    .replace(/^How to read this briefing: /, '')
    .replace('A claim-by-claim source list accompanies this document.', 'The claim-by-claim source list is in [`03-source-list`](../03-source-list/source-list.md); PDF and Word versions of this briefing are in this folder.');
  L.push(`> **How to read this briefing:** ${howto}`, '');
  for (const sec of BRIEFING.sections) {
    L.push(`## ${sec.h1}`, '');
    if (sec.intro) L.push(`_${mdInline(sec.intro)}_`, '');
    for (const b of sec.blocks || []) {
      if (b.p) L.push(mdInline(b.p), '');
      if (b.h2) L.push(`### ${b.h2}`, '');
      if (b.bullets) { b.bullets.forEach((t) => L.push(`- ${mdInline(t)}`)); L.push(''); }
      if (b.analysis) b.analysis.forEach((t) => L.push(`> **ANALYSIS · IN BRIEF** ${mdInline(t)}`, ''));
      if (b.glossary) {
        L.push('| Term | Meaning |', '|---|---|');
        b.glossary.forEach(([term, t]) => L.push(`| **${term}** | ${mdInline(t)} |`));
        L.push('');
      }
    }
    for (const pt of sec.points || []) {
      L.push(`### ${pt.h2}`, '', `**Basis (facts):** ${mdInline(pt.basis)}`, '', `> **ANALYSIS** ${mdInline(pt.analysis)}`, '');
    }
  }
  L.push('---', '', `_${BRIEFING.footer}_`, '');
  return L.join('\n');
}

function buildSourcesMd() {
  const L = [];
  const cellText = (s) => s.replace(/\|/g, '\\|');
  L.push('# Source list: every factual claim and its source', '');
  L.push(`Covers the [briefing](../01-briefing/new-ceo-briefing.md) and the [X thread](../02-x-thread/x-thread.md) on Christian Westerlind Wigstrom. All sources accessed ${ACCESSED}. Claim numbers (C01…) follow the order in which claims first appear in the briefing. **Task resource** = listed in the task brief; **Supplementary** = additional public record, used only where the task resources do not cover a fact.`, '');
  L.push('## A. Sources', '', '| ID | Source | Type | Link | Access notes |', '|---|---|---|---|---|');
  for (const [id, s] of Object.entries(SOURCES)) {
    const meta = `${s.publisher}${s.date !== 'n/a' ? `, ${s.date}` : ''}`;
    L.push(`| ${id} | **${cellText(s.title)}**<br>${cellText(meta)} | ${s.tier} | <${s.url}> | ${cellText(s.note || '—')} |`);
  }
  L.push('', '## B. Claim map: briefing', '');
  for (const group of claimsBySection()) {
    L.push(`### ${group.heading}`, '', '| # | Claim as stated in the briefing | Source | Supporting excerpt (verbatim; … marks omitted text) |', '|---|---|---|---|');
    for (const key of group.keys) {
      const cl = CLAIMS[key];
      const ids = Object.keys(cl.ev);
      L.push(`| ${claimNo(key)} | ${cellText(cl.text)} | ${ids.map((id) => `[${id}](${SOURCES[id].url})`).join('<br>')} | ${ids.map((id) => `**${id}:** _“${cellText(cl.ev[id])}”_`).join('<br>')} |`);
    }
    L.push('');
  }
  L.push('## C. Claim map: X thread', '', '| Post | Claims | Link(s) in the post |', '|---|---|---|');
  threadPosts.forEach((p, i) => {
    L.push(`| ${i + 1}/${THREAD.length} | ${p.claims.map(claimNo).join(', ')} | ${p.sources.map((id) => `[${id}](${SOURCES[id].url}) ${SOURCES[id].label}`).join('<br>')} |`);
  });
  L.push('', '## D. Verification notes', '');
  VERIFICATION_NOTES.forEach((n) => L.push(`- ${n}`));
  L.push('');
  return L.join('\n');
}

function buildThreadTxt() {
  return threadPosts.map((p) => p.body).join('\n\n---\n\n') + '\n';
}

function buildThreadMd() {
  const L = [];
  L.push('# X thread: Redbelly’s incoming CEO', '');
  L.push(`${THREAD.length} posts. Each fits X’s 280-character limit (X counts every link as 23 characters). Every post that states a fact links its source; posts 7 and 8 are labelled as analysis. Claim numbers refer to the [source list](../03-source-list/source-list.md). A copy-paste version without formatting is in [\`x-thread.txt\`](x-thread.txt).`, '');
  threadPosts.forEach((p, i) => {
    L.push(`### Post ${i + 1}/${THREAD.length}`, '', '```text', p.body, '```', '', `${p.length}/280 characters · Claims: ${p.claims.map(claimNo).join(', ')}`, '');
  });
  return L.join('\n');
}

// ---------------------------------------------------------------- write everything

(async () => {
  fs.writeFileSync(OUT.briefingDocx, await Packer.toBuffer(buildBriefingDocx()));
  fs.writeFileSync(OUT.sourcesDocx, await Packer.toBuffer(buildSourcesDocx()));
  fs.writeFileSync(OUT.briefingMd, buildBriefingMd());
  fs.writeFileSync(OUT.sourcesMd, buildSourcesMd());
  fs.writeFileSync(OUT.threadTxt, buildThreadTxt());
  fs.writeFileSync(OUT.threadMd, buildThreadMd());
  console.log(`Claims: ${claimOrder.length} · Sources: ${Object.keys(SOURCES).length} · Thread posts: ${threadPosts.length}`);
  threadPosts.forEach((p, i) => console.log(`  post ${i + 1}: ${p.length}/280`));
  for (const f of Object.values(OUT)) console.log('  wrote', path.relative(ROOT, f));
})();

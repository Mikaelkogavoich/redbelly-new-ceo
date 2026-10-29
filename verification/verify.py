#!/usr/bin/env python3
"""Checks the three TASK-28 deliverables against the task's quality benchmarks and failure criteria.

It reads only the published files (Markdown, text and PDF), not the build inputs, so it is an
independent check of what reviewers will see.

Offline checks (default):
  1. Every link in the briefing (Markdown and PDF) and the thread is a source registered in the source list,
     and every registered source is cited in the briefing.
  2. Every factual line of the briefing carries at least one source link.
  3. Every quotation in the briefing and the thread appears verbatim in the source list's supporting excerpts.
  4. The thread has 5-8 posts, each within X's 280-character limit, each linking at least one source.
  5. Guardrails: no price talk, no private-life terms, no personal credits in any deliverable.

Online check (--online): requests every registered source URL once and records the HTTP status.

Usage:
  python3 verification/verify.py            # offline checks, print report
  python3 verification/verify.py --online   # also check links
  python3 verification/verify.py --online --write   # save report to verification/verification-report.md
Exit status is 1 if any offline check fails. Link-check results are reported but never fail the run,
because some publishers refuse automated clients.
"""

import argparse
import datetime
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BRIEFING_MD = ROOT / '01-briefing' / 'new-ceo-briefing.md'
BRIEFING_PDF = ROOT / '01-briefing' / 'new-ceo-briefing.pdf'
THREAD_TXT = ROOT / '02-x-thread' / 'x-thread.txt'
SOURCES_MD = ROOT / '03-source-list' / 'source-list.md'
README = ROOT / 'README.md'
REPORT = ROOT / 'verification' / 'verification-report.md'

MD_LINK = re.compile(r'\]\((https?://[^)\s]+)\)')
BARE_URL = re.compile(r'https?://\S+')


def norm_url(url):
    """Treat https://example.com and https://example.com/ as the same address."""
    return url[:-1] if url.endswith('/') and url.count('/') == 3 else url


def norm_text(s):
    s = s.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    s = s.replace('…', '...').replace('–', '-').replace('—', '-').replace('\\|', '|')
    return re.sub(r'\s+', ' ', s).strip().lower()


def x_length(post):
    """twitter-text v3 weighting: URLs count 23; most CJK and emoji count 2."""
    urls = BARE_URL.findall(post)
    n = 0
    for ch in BARE_URL.sub('', post):
        cp = ord(ch)
        light = cp <= 4351 or 8192 <= cp <= 8205 or 8208 <= cp <= 8223 or 8242 <= cp <= 8247
        n += 1 if light else 2
    return n + 23 * len(urls)


def load_registry():
    rows = re.findall(r'^\| (S\d+) \|.*?<(https?://[^>]+)>', SOURCES_MD.read_text(encoding='utf-8'), re.M)
    return {sid: url for sid, url in rows}


def section(text, start, end=None):
    i = text.index(start)
    j = text.index(end, i) if end else len(text)
    return text[i:j]


def run_offline():
    results = []  # (name, passed, details)
    registry = load_registry()
    reg_urls = {norm_url(u) for u in registry.values()}
    briefing = BRIEFING_MD.read_text(encoding='utf-8')
    thread = THREAD_TXT.read_text(encoding='utf-8')
    sources = SOURCES_MD.read_text(encoding='utf-8')
    excerpts = norm_text(section(sources, '## B. Claim map', '## C. Claim map'))

    # 1. links resolve to registered sources
    md_links = {norm_url(u) for u in MD_LINK.findall(briefing)}
    pdf_links = {norm_url(u.decode('latin-1')) for u in re.findall(rb'/URI\s*\(([^)]*)\)', BRIEFING_PDF.read_bytes())}
    thread_links = {norm_url(u) for u in BARE_URL.findall(thread)}
    unknown = sorted((md_links | pdf_links | thread_links) - reg_urls)
    uncited = sorted(sid for sid, u in registry.items() if norm_url(u) not in md_links)
    missing_in_pdf = sorted(md_links - pdf_links)
    ok = not unknown and not uncited and not missing_in_pdf and len(registry) > 0
    detail = (f'{len(registry)} registered sources; briefing cites {len(md_links)} (Markdown) and '
              f'{len(pdf_links)} (PDF) distinct URLs; thread links {len(thread_links)}.')
    if unknown:
        detail += ' Unregistered: ' + ', '.join(unknown)
    if uncited:
        detail += ' Registered but not cited in the briefing: ' + ', '.join(uncited)
    if missing_in_pdf:
        detail += ' In Markdown but not in PDF: ' + ', '.join(missing_in_pdf)
    results.append(('Every link is a registered source, and every source is cited', ok, detail))

    # 2. every factual line carries a source link
    body = briefing[briefing.index('## 1.'):]
    uncited_lines = []
    factual = 0
    for n, line in enumerate(body.splitlines(), 1):
        s = line.strip()
        if (not s or s.startswith('#') or s.startswith('>') or s == '---' or s.startswith('|---')
                or s.startswith('| Term') or (s.startswith('_') and s.endswith('_'))):
            continue  # headings, analysis boxes, notes, table furniture
        factual += 1
        if not MD_LINK.search(s):
            uncited_lines.append(s[:90])
    results.append(('Every factual line in the briefing has a source link', not uncited_lines,
                    f'{factual} factual lines checked.' + ('' if not uncited_lines else
                    ' Missing a link: ' + ' | '.join(uncited_lines))))

    # 3. quotations appear verbatim in the supporting excerpts
    quotes = re.findall(r'“([^”]+)”', BARE_URL.sub('', briefing))
    quotes += re.findall(r'"([^"]+)"', BARE_URL.sub('', thread))
    not_found = []
    for q in quotes:
        nq = norm_text(q).rstrip('.,;: ')
        if nq not in excerpts:
            not_found.append(q)
    results.append(('Every quotation appears verbatim in a source excerpt', not not_found,
                    f'{len(quotes)} quotations checked.' + ('' if not not_found else
                    ' Not found: ' + ' | '.join(not_found))))

    # 4. thread shape and limits
    posts = [p.strip() for p in thread.split('\n---\n') if p.strip()]
    problems = []
    for i, p in enumerate(posts, 1):
        length = x_length(p)
        if length > 280:
            problems.append(f'post {i} is {length} characters')
        if not BARE_URL.search(p):
            problems.append(f'post {i} has no source link')
    if not 5 <= len(posts) <= 8:
        problems.append(f'{len(posts)} posts (task asks for roughly 5-8)')
    lengths = ', '.join(str(x_length(p)) for p in posts)
    results.append(('X thread: 5-8 posts, each <= 280 characters with a source link', not problems,
                    f'{len(posts)} posts; lengths {lengths}.' + ('' if not problems else ' ' + '; '.join(problems))))

    # 5. guardrails
    # Disclaimers and the README's description of these checks name the banned topics on purpose.
    allowed = [
        'no price commentary, investment advice or promises of returns',
        'no price commentary or investment advice',
        'price talk, investment advice and promises of returns',
        'no price talk, private-life terms or personal credits',
    ]
    patterns = {
        'price talk': [r'\bprice', r'\brbnt\b', r'\binvestment advice', r'\bbuy\b', r'\bsell\b', r'\bbullish\b',
                       r'\bbearish\b', r'\bmoon\b', r'\bpump\b', r'\b\d+x\b', r'\bprofit', r'\breturns?\b'],
        'private life': [r'\bwife\b', r'\bhusband\b', r'\bmarried\b', r'\bchild(ren)?\b', r'\bfamily\b', r'\bborn\b',
                         r'\bmilitary\b', r'\bsartorial\b', r'\bhobb(y|ies)\b', r'\bhometown\b'],
        # Credit lines ("Prepared by ...", "Author: ..."), handles and copyright marks; not ordinary prose
        # such as "a payment is made by a customer".
        'personal credit': [r'(?m)^[\W_]*(made|prepared|written|authored|compiled|created|designed|produced) by\b',
                            r'\b(author|authors|credits?|signed)\s*:', r'(?<![\w.])@[a-z0-9_]{2,15}\b', '©'],
    }
    hits = []
    for f in (BRIEFING_MD, THREAD_TXT, SOURCES_MD, README):
        text = BARE_URL.sub('', f.read_text(encoding='utf-8')).lower()
        for phrase in allowed:
            text = text.replace(phrase, '')
        for kind, pats in patterns.items():
            for pat in pats:
                for m in re.finditer(pat, text):
                    hits.append(f'{f.relative_to(ROOT)}: {kind} "{m.group(0)}"')
    results.append(('No price talk, private-life terms or personal credits', not hits,
                    'Scanned briefing, thread, source list and README.' + ('' if not hits else ' Hits: ' + '; '.join(hits))))
    return results, registry


def run_online(registry):
    rows = []
    for sid, url in registry.items():
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; source-link-check/1.0)'})
        try:
            with urllib.request.urlopen(req, timeout=25) as r:
                rows.append((sid, url, str(r.status), 'reachable' + (f' (redirected to {r.url})' if r.url != url else '')))
        except urllib.error.HTTPError as e:
            note = 'refuses automated clients; open in a browser' if e.code in (401, 403, 429, 999) else 'error'
            rows.append((sid, url, str(e.code), note))
        except Exception as e:  # network failure, timeout, TLS
            rows.append((sid, url, '-', f'no response from this network ({type(e).__name__}); open in a browser'))
    return rows


def render(results, links):
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    L = ['# Verification report', '', f'Generated {stamp} by `verification/verify.py`.', '',
         '| Check | Result | Details |', '|---|---|---|']
    for name, ok, detail in results:
        L.append(f'| {name} | {"PASS" if ok else "FAIL"} | {detail} |')
    if links is not None:
        L += ['', '## Link status', '',
              'Some publishers refuse requests that do not come from a browser; those rows are expected and do not '
              'mean the link is broken. Every source was also read in full during research (see the source list, section D).',
              '', '| ID | URL | HTTP | Note |', '|---|---|---|---|']
        L += [f'| {sid} | <{url}> | {code} | {note} |' for sid, url, code, note in links]
    return '\n'.join(L) + '\n'


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('--online', action='store_true', help='also request every source URL')
    ap.add_argument('--write', action='store_true', help=f'save the report to {REPORT.relative_to(ROOT)}')
    args = ap.parse_args()
    results, registry = run_offline()
    links = run_online(registry) if args.online else None
    report = render(results, links)
    print(report)
    if args.write:
        REPORT.write_text(report, encoding='utf-8')
    sys.exit(0 if all(ok for _, ok, _ in results) else 1)


if __name__ == '__main__':
    main()

# New CEO briefing: Christian Westerlind Wigstrom

Submission for [Redbelly DAO TASK-28, New CEO Briefing](https://taskboard.redbellydao.network/tasks/TASK-28): a sourced briefing on Redbelly Network’s incoming CEO and what his track record suggests for Tokeniser.

## Deliverables

| # | Deliverable | Read this | Other formats |
|---|---|---|---|
| 1 | Briefing (3 pages, A4) | [`01-briefing/new-ceo-briefing.pdf`](01-briefing/new-ceo-briefing.pdf) | [Word](01-briefing/new-ceo-briefing.docx) · [Markdown](01-briefing/new-ceo-briefing.md) |
| 2 | X thread (8 posts) | [`02-x-thread/x-thread.md`](02-x-thread/x-thread.md) | [Plain text for copy-paste](02-x-thread/x-thread.txt) |
| 3 | Source list (53 claims, 18 sources) | [`03-source-list/source-list.md`](03-source-list/source-list.md) | [PDF](03-source-list/source-list.pdf) · [Word](03-source-list/source-list.docx) |

## How facts and analysis are handled

- **Every fact is sourced.** Each factual statement carries a link to a source that contains it. The source list gives every claim a number, its source(s) and the verbatim supporting excerpt. All sources were opened and read on 29 October 2026.
- **Facts and analysis are kept apart.** Interpretation appears only in boxes marked **ANALYSIS**. In the analysis section, each point first states its factual basis, with sources, and then gives the analysis.
- **Quotes are verbatim.** Every quotation appears word for word in the cited source; the checker below enforces this.
- **Source policy.** The six resources listed in the task come first. Where they do not cover a fact from his public professional record (the Oxford PhD, the UK Parliament and Zimbabwe roles, Monoova’s payments specialism, AusPayNet’s remit), additional public sources are used and labelled *Supplementary* in the source list.
- **Deliberately excluded.** Anything about his private life or outside the professional record; price talk, investment advice and promises of returns; personal credits of any kind.
- **Known limits** (a partial paywall, a logged-out LinkedIn view, and details that differ between sources) are listed in section D of the source list, with how each was handled.

## Verification

```bash
python3 verification/verify.py
```

The checker reads only the published files and confirms that:

1. every link is a registered source, and every source is cited;
2. every factual line has a source link;
3. every quotation appears verbatim in a source excerpt;
4. each thread post is within X’s 280-character limit and links its source;
5. no price talk, private-life terms or personal credits appear.

Add `--online` to request every source URL and record its HTTP status, and `--write` to save the report. The latest saved run is in [`verification/verification-report.md`](verification/verification-report.md).

## Rebuilding

All three deliverables are generated from a single file, [`build/content.js`](build/content.js). It holds every sentence, source, claim and supporting excerpt, and the build stops if any citation does not match its claim's evidence. Requirements: Node.js 18+, LibreOffice (`soffice`) and Python 3.

```bash
cd build && npm install && cd ..
bash build/build.sh
```

## Layout

```text
01-briefing/        briefing as PDF, Word and Markdown
02-x-thread/        thread as formatted Markdown and copy-paste text
03-source-list/     claim-by-claim source list as Markdown, PDF and Word
verification/       verify.py and the latest report
build/              content.js (single source), build.js, build.sh
```

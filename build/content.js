// Single source of truth for all three deliverables.
//
// Inline markup used in briefing text:
//   [[claim-key:S1,S2]]  citation: renders as hyperlinked source labels; claim-key maps to CLAIMS
//   **text**             bold
//   _text_               italic
//
// Every claim key used in the text must exist in CLAIMS, and the sources in the marker must match
// the sources listed for that claim. build.js enforces both rules and fails the build otherwise.

const ACCESSED = '29 October 2026';

const SOURCES = {
  S1: {
    label: 'Redbelly',
    title: 'Redbelly’s new CEO is a payments pioneer betting on regulated tokenisation',
    publisher: 'Redbelly Network (official announcement)',
    date: '16 Sep 2026',
    url: 'https://redbelly.network/blog/redbelly-new-CEO-is-a-payments-pioneer-betting-on-regulated-tokenisation',
    tier: 'Task resource',
    note: 'Full text read.',
  },
  S2: {
    label: 'Medianet',
    title: 'Redbelly’s new CEO is a payments pioneer betting on regulated tokenisation (press release)',
    publisher: 'Medianet News Hub',
    date: '16 Sep 2026',
    url: 'https://newshub.medianet.com.au/2026/09/redbellys-new-ceo-is-a-payments-pioneer-betting-on-regulated-tokenisation/171783/',
    tier: 'Task resource',
    note: 'Wire copy of S1; excerpts used here match S1.',
  },
  S3: {
    label: 'SMB Tech',
    title: 'Redbelly Network Taps Monoova Co-Founder As Chief Executive To Lead Regulated Tokenisation Push',
    publisher: 'SMB Tech (staff writer)',
    date: '16 Sep 2026',
    url: 'https://smbtech.au/news/redbelly-network-taps-monoova-co-founder-as-chief-executive-to-lead-regulated-tokenisation-push/',
    tier: 'Task resource',
    note: 'Independent news report. Full text read.',
  },
  S4: {
    label: 'Banking Day',
    title: 'Redbelly announces paytech co-founder Christian Westerlind Wigstrom as CEO to push into tokenisation',
    publisher: 'Banking Day',
    date: '17 Sep 2026',
    url: 'https://www.bankingday.com/redbelly-announces-paytech-co-founder-christian-westerlind-wigstrom-as-ceo-to-push-into-tokenisation',
    tier: 'Task resource',
    note: 'Partly paywalled. Every excerpt used is in the free, visible portion.',
  },
  S5: {
    label: 'LinkedIn',
    title: 'Christian Westerlind Wigstrom: public professional profile',
    publisher: 'LinkedIn',
    date: 'n/a',
    url: 'https://www.linkedin.com/in/christian-westerlind-wigstrom/',
    tier: 'Task resource',
    note: 'Logged-out view (redirects to au.linkedin.com). Used only for the About line, the Education entry and his own posts listing board roles.',
  },
  S6: {
    label: 'Tokeniser',
    title: 'Tokeniser homepage: “Give your Australian fund a global edge”',
    publisher: 'Tokeniser (a Redbelly Network project)',
    date: 'n/a',
    url: 'https://tokeniser.com',
    tier: 'Task resource',
    note: 'Company website; figures are as reported by the company.',
  },
  S7: {
    label: 'Tokeniser/why-tokenise',
    title: 'Why tokenise? Why now?',
    publisher: 'Tokeniser',
    date: 'n/a',
    url: 'https://tokeniser.com/why-tokenise',
    tier: 'Task resource (Tokeniser site section)',
    note: '',
  },
  S8: {
    label: 'Tokeniser/technology',
    title: 'Our Technology',
    publisher: 'Tokeniser',
    date: 'n/a',
    url: 'https://tokeniser.com/technology',
    tier: 'Task resource (Tokeniser site section)',
    note: 'States that its network figures are “published by Redbelly Network”.',
  },
  S9: {
    label: 'Tokeniser/settlement',
    title: 'Instant settlement',
    publisher: 'Tokeniser',
    date: 'n/a',
    url: 'https://tokeniser.com/product/superpowers/instant-settlement',
    tier: 'Task resource (Tokeniser site section)',
    note: '',
  },
  S10: {
    label: 'Tokeniser/efficiency',
    title: 'Efficiency',
    publisher: 'Tokeniser',
    date: 'n/a',
    url: 'https://tokeniser.com/product/efficiency',
    tier: 'Task resource (Tokeniser site section)',
    note: '',
  },
  S11: {
    label: 'Tokeniser/funds',
    title: 'For Funds',
    publisher: 'Tokeniser',
    date: 'n/a',
    url: 'https://tokeniser.com/solutions/funds',
    tier: 'Task resource (Tokeniser site section)',
    note: '',
  },
  S12: {
    label: 'Monoova',
    title: 'Who are Monoova and what do we do? A Chat with Christian Westerlind Wigstrom',
    publisher: 'Monoova (company blog interview)',
    date: '30 Apr 2024',
    url: 'https://www.monoova.com/blog/who-are-monova-and-what-do-we-do-a-chat-with-christian-westerlind-wigstrom',
    tier: 'Supplementary public record',
    note: 'His own answers as Monoova CEO. Company source.',
  },
  S13: {
    label: 'AusPayPlus',
    title: 'Using API integration to match fast payments with fast reconciliation',
    publisher: 'Australian Payments Plus (AP+)',
    date: 'n/a',
    url: 'https://www.auspayplus.com.au/solutions/nppa-using-api-integration-to-match-fast-payments-with-fast-reconciliation',
    tier: 'Supplementary public record',
    note: 'Case study quoting him as Monoova CEO.',
  },
  S14: {
    label: 'Business Conversation',
    title: 'Contributor profile: Christian Westerlind Wigstrom',
    publisher: 'The Business Conversation',
    date: 'n/a',
    url: 'https://www.thebusinessconversation.com.au/contributor/christian-westerlind-wigstrom',
    tier: 'Supplementary public record',
    note: 'Contributor biography published alongside his 2021 article as Monoova CEO.',
  },
  S15: {
    label: 'Talking Business',
    title: 'Christian Westerlind Wigstrom, Head of Monoova (episode page)',
    publisher: 'Talking Business podcast (Qantas), hosted on Omny.fm',
    date: 'n/a',
    url: 'https://omny.fm/shows/talking-business/christian-westerlind-wigstrom-head-of-monoova',
    tier: 'Supplementary public record',
    note: 'Episode description.',
  },
  S16: {
    label: 'INET',
    title: 'Christian Westerlind Wigstrom: expert profile',
    publisher: 'Institute for New Economic Thinking (INET)',
    date: 'n/a',
    url: 'https://ineteconomics.org/research/experts/cwwigstrom',
    tier: 'Supplementary public record',
    note: 'Profile written while he was a doctoral student.',
  },
  S17: {
    label: 'Prospect',
    title: 'Author page: Christian Westerlind Wigstrom',
    publisher: 'Prospect Magazine',
    date: 'n/a',
    url: 'https://prospectmagazine.co.uk/author/4761/christian-westerlind-wigstrom',
    tier: 'Supplementary public record',
    note: 'Author biography.',
  },
  S18: {
    label: 'AusPayNet',
    title: 'About',
    publisher: 'Australian Payments Network (AusPayNet)',
    date: 'n/a',
    url: 'https://auspaynet.com.au/about',
    tier: 'Supplementary public record',
    note: 'Organisation’s own description of its role.',
  },
};

// claim key -> { text: claim as stated in the briefing, ev: { sourceId: verbatim supporting excerpt } }
const CLAIMS = {
  'appointment': {
    text: 'Redbelly announced on 16 September 2026 that Christian Westerlind Wigstrom will become CEO, starting November 2026.',
    ev: {
      S1: '16 September 2026 … Today, Redbelly Network announced the appointment of Christian Westerlind Wigstrom as Chief Executive Officer to start November 2026.',
      S2: 'Christian Westerlind Wigstrom as Chief Executive Officer to start November 2026 (release dated 16 September 2026)',
      S3: 'Australian blockchain firm, Redbelly Network, has appointed payments industry veteran, Christian Westerlind Wigstrom, as its new Chief Executive Officer, with the role to commence in November 2026. (published September 16, 2026)',
    },
  },
  'start-date': {
    text: 'Banking Day gives the start date as Monday 2 November 2026.',
    ev: {
      S4: 'Redbelly Network has announced the appointment of Christian Westerlind Wigstrom as its new CEO to start on Monday, 2 November 2026.',
    },
  },
  'cofounder': {
    text: 'He co-founded Monoova and was its CEO for almost ten years, until 2026.',
    ev: {
      S1: 'As Co-Founder and CEO of payments platform Monoova, most recently, Christian Westerlind Wigstrom built a leading fintech serving clients with embedded payments.',
      S4: 'his almost 10-year tenure at payment services provider Monoova, where he was co-founder, and CEO until July this year.',
      S5: 'Co-Founder and CEO of Monoova until May 2026 (About section)',
    },
  },
  'push': {
    text: 'Redbelly says he joins to lead its push into regulated tokenisation.',
    ev: {
      S1: 'Christian joins to lead the company\'s push into regulated tokenisation.',
      S3: 'Headline: Redbelly Network Taps Monoova Co-Founder As Chief Executive To Lead Regulated Tokenisation Push',
    },
  },
  'tokeniser-onchain': {
    text: 'Tokeniser delivers Redbelly’s tokenisation strategy and brings fund and equity administration on-chain for regulated markets.',
    ev: {
      S1: 'Its tokenisation strategy, delivered through Tokeniser, brings fund and equity administration on-chain for regulated markets.',
    },
  },
  'monoova-what': {
    text: 'Monoova is a payment service provider specialising in real-time payments and payments automation; its APIs let companies tailor how they receive, manage and pay funds.',
    ev: {
      S12: 'Monoova is a leading payment service provider (PSP) in Australia. We specialise in real-time payments and payments automation for businesses. Through our APIs, companies can tailor how they receive, manage and pay funds. … the aspect of our product that we are most proud of is our virtual-account and automated, real-time reconciliation features.',
    },
  },
  'tk-dvp': {
    text: 'On Tokeniser, cash and units are exchanged in a single step and the register updates at the same time; the site presents this as a move from T+2 to T+0 settlement.',
    ev: {
      S9: 'Move from T+2 to T+0 settlement. … On Tokeniser, cash and units are exchanged in a single step and the register updates simultaneously, or the transaction does not proceed.',
    },
  },
  'npp': {
    text: 'NPP (New Payments Platform): the infrastructure for real-time payments in Australia, including PayID and PayTo payments.',
    ev: {
      S12: 'We provide a range of payment types from real-time NPP (New Payments Platform) payments using PayID and PayTo',
      S13: 'the introduction of real-time payments in Australia … giving companies access to NPP through APIs is critical.',
    },
  },
  'payid': {
    text: 'PayID: an identifier such as an email address or phone number that replaces BSB and account numbers.',
    ev: {
      S12: 'PayIDs remove the need for sharing BSB and bank numbers and allow people to use unique aliases instead, identifiers that people already have committed to memory such as an email or their phone number.',
    },
  },
  'payto': {
    text: 'PayTo: like a real-time direct debit; the customer approves a digital agreement, then the business can request payments that transfer instantly.',
    ev: {
      S12: 'Once the customer has agreed to a digital agreement, sent to their mobile or online banking, the merchant can automatically request payment and funds are transferred instantly. In this sense, PayTo is like a modern, real-time, direct debit.',
    },
  },
  'api': {
    text: 'API: a direct connection between software systems; a single API integration can connect real-time payments to an organisation’s software.',
    ev: {
      S13: 'A single API integration connects real-time payments directly to an organisation’s software system.',
    },
  },
  'recon': {
    text: 'Reconciliation: matching each incoming payment to the customer who made it; done manually, it relies on payment references.',
    ev: {
      S13: 'When a payment is made by a customer, Monoova sends a detailed notification to the business informing them that funds have been received. … It removes lengthy and error-prone manual references previously required for reconciliation',
    },
  },
  'tokenisation': {
    text: 'Tokenisation: recording ownership of financial products as digital tokens, with the asset’s rules programmed in.',
    ev: {
      S6: 'Tokenisation records ownership of financial products and services as digital tokens, and lets you program the rules of the asset.',
    },
  },
  'tplus': {
    text: 'T+2 / T+0: settlement two business days after a trade (common in listed funds) versus settlement at the point of trade.',
    ev: {
      S9: 'Every subscription, redemption and transfer remains unsettled for two business days in listed funds, and often longer in private assets. … Settlement, at the point of trade.',
    },
  },
  'scale': {
    text: 'By the end of his tenure, Monoova had processed $200bn and transacted with more than 10% of all Australians, operating “behind the scenes” of other brands.',
    ev: {
      S1: 'At the end of Christian’s tenure, Monoova had processed $200bn transacting with more than 10% of all Australians by acting “behind the scenes” of several leading, innovative brands.',
    },
  },
  'payto-payid': {
    text: 'Monoova became Australia’s largest PayTo processor, issued almost a quarter of the country’s PayIDs and won FinTech Australia’s Fintech Organisation of the Year.',
    ev: {
      S1: 'Monoova became Australia’s largest PayTo processor, issued almost a quarter of the country’s PayIDs and won Fintech Australia’s Fintech Organisation of the Year.',
    },
  },
  'clients': {
    text: 'Monoova’s clients included Wise and Carsales.com.au.',
    ev: {
      S1: 'He co-founded one of Australia\'s most significant payments businesses serving major platforms such as Wise and Carsales.com.au',
    },
  },
  'nonbank': {
    text: 'Monoova was one of a very small group of non-banks enabled on the NPP.',
    ev: {
      S15: 'recently becoming one of a very small group of non-banks to be enabled on the New Payments Platform (NPP).',
    },
  },
  'noticed': {
    text: 'His quoted view: if a real-time payment is only noticed when someone logs on to their banking portal, the onward payment flow is not real-time.',
    ev: {
      S13: '“In other words, if a real-time payment is only ‘noticed’ when someone logs on to their banking portal, the onward payment flow is not real-time,” Christian said.',
    },
  },
  'automatcher': {
    text: 'Monoova’s Automatcher issues unique, repeat-use PayIDs so incoming payments can be reconciled without manual references.',
    ev: {
      S13: 'Monoova has developed ‘Automatcher’ … a solution which issues large numbers of unique, repeat-use PayIDs … It removes lengthy and error-prone manual references previously required for reconciliation',
    },
  },
  'boards': {
    text: 'He has served on the boards of FinTech Australia and the Australian Payments Network (AusPayNet).',
    ev: {
      S1: 'served on the boards of FinTech Australia and the Australian Payments Network.',
      S3: 'Beyond Monoova, Westerlind Wigstrom has served on the boards of FinTech Australia and the Australian Payments Network',
    },
  },
  'fta-role': {
    text: 'He has served as Director and Treasurer of FinTech Australia.',
    ev: {
      S5: 'serve as Director and Treasurer on the Board of FinTech Australia. (his own post)',
    },
  },
  'apn-role': {
    text: 'He has served as an Alternate Director of AusPayNet.',
    ev: {
      S4: 'Westerlind Wigstrom also sits on the board of FinTech Australia and serves as an alternate director at AusPayNet.',
      S5: 'Alternate Director on the Board of the Australian Payments Network (AusPayNet). (his own post)',
    },
  },
  'apn-about': {
    text: 'AusPayNet’s role includes facilitating self-regulation and coordinating system-wide standards for the payments system; it has more than 150 members and participants.',
    ev: {
      S18: 'Australian Payments Network champions the payments system. … our role includes: inspiring innovation; facilitating self-regulation; coordinating system-wide standards; policy development. Our network includes more than 150 members and participants',
    },
  },
  'phd': {
    text: 'He holds a PhD from the University of Oxford.',
    ev: {
      S14: 'While completing his PhD at Oxford',
      S15: 'Holds numerous degrees including a PhD in International Relations from Oxford.',
      S17: 'has a PhD in African trade politics (Oxon)',
    },
  },
  'oxford-dates': {
    text: 'His public profile lists Oxford University for 2008 to 2012.',
    ev: {
      S5: 'Education: Oxford University, 2008 - 2012',
    },
  },
  'inet': {
    text: 'As a doctoral student he worked with Robert Skidelsky on economic policy and theory and co-edited The Economic Crisis and the State of Economics (Palgrave Macmillan).',
    ev: {
      S16: 'A third-year doctoral student at the University of Oxford, Christian Westerlind Wigstrom has been working with Robert Skidelsky at the intersection of economic policy and theory since the beginning of the financial crisis. … co-edited a book, The Economic Crisis and the State of Economics (Palgrave Macmillan), with Robert Skidelsky',
    },
  },
  'parliament': {
    text: 'While completing the PhD he worked as an economic advisor and speechwriter in the UK Parliament, in the House of Lords.',
    ev: {
      S14: 'While completing his PhD at Oxford, he worked as an economic advisor and speech writer in the UK Parliament',
      S15: 'Christian has worked as a speech writer and economic advisor in the House of Lords.',
    },
  },
  'zimbabwe': {
    text: 'He then spent three years as Chief of Staff and Markets at a large agricultural startup in Zimbabwe.',
    ev: {
      S14: 'before spending three years as Chief of Staff and Markets at a large agricultural startup in Zimbabwe.',
    },
  },
  'zim-energy': {
    text: 'Another profile describes the company as an agriculture and renewable-energy company.',
    ev: {
      S15: 'Was ‘Chief of Staff and Markets’ at an agriculture and renewable-energy company in Zimbabwe.',
    },
  },
  'zim-harare': {
    text: 'The company was based in Harare.',
    ev: {
      S17: 'a former Chief of Staff and Markets of a large African agriculture company based in Harare',
    },
  },
  'consulting': {
    text: 'He has consulted for firms in Iraq, Sweden, the US and the UK.',
    ev: {
      S15: 'Has consulted for firms in Iraq, Sweden, the US and the UK.',
    },
  },
  'patented': {
    text: 'Redbelly says it has spent years building rigorous, patented technology to support the management of regulated assets, with regulators and the scientific community.',
    ev: {
      S1: 'In collaboration with regulators and the scientific community, Redbelly has spent years building rigorous, patented technology to support the management of regulated assets.',
    },
  },
  'l1': {
    text: 'Redbelly describes itself as a Layer 1 blockchain built for regulated finance, with native identity and compliance.',
    ev: {
      S1: 'Redbelly Network is a Layer 1 blockchain built for regulated finance, with native identity and compliance.',
    },
  },
  'pdti': {
    text: 'Redbelly’s compliance work, including Public Digital Token Infrastructure (PDTI), is aimed at operating inside the licensed environment created by the Digital Assets Framework.',
    ev: {
      S1: 'Its compliance work, including Public Digital Token Infrastructure (PDTI), is specifically aimed at operating inside the licensed environment created by the Digital Assets Framework.',
    },
  },
  'thesis': {
    text: 'Redbelly links the appointment to the idea that payments infrastructure must be good enough to disappear into the background, and says he is applying that same thesis to regulated capital-markets infrastructure.',
    ev: {
      S1: 'One idea was critical: payments infrastructure must be good enough to disappear into the background. … As CEO of Redbelly Network, Christian is applying that same thesis to regulated capital-markets infrastructure',
    },
  },
  'settlement-layer': {
    text: 'Redbelly positions itself as the settlement layer for regulated markets.',
    ev: {
      S1: 'it is the settlement layer for regulated markets, not just another chain chasing attention.',
    },
  },
  'q-credibility': {
    text: 'Quote on regulatory credibility and compliance as a product edge.',
    ev: {
      S1: '“One of Redbelly’s many strengths is its regulatory credibility. In payments, I learnt that success belonged to the company that saw compliance as a product edge rather than a tick box.',
    },
  },
  'q-loudest': {
    text: 'Quote: the next era of finance will be won by the chain that institutions can actually use.',
    ev: {
      S1: '“The next era of finance won\'t be won by the loudest chain,” according to Christian. “It\'ll be won by the chain that institutions can actually use.”',
      S2: '“The next era of finance won\'t be won by the loudest chain,” (attributed to Christian)',
    },
  },
  'daf': {
    text: 'The Corporations Amendment (Digital Assets Framework) Act brings digital-asset and tokenised-custody platforms into the same licensing regime as brokers and fund managers.',
    ev: {
      S1: 'The Corporations Amendment (Digital Assets Framework) Act became law in 2026, bringing digital-asset platforms and tokenised-custody platforms into the same licensing regime as brokers and fund managers.',
    },
  },
  'daf-dates': {
    text: 'The Act received Royal Assent on 8 April 2026 and commences on 9 April 2027.',
    ev: {
      S7: 'The Corporations Amendment (Digital Assets Framework) Act 2026 received Royal Assent on 8 April 2026. … The Framework passed Parliament on 1 April 2026 and commences 9 April 2027.',
    },
  },
  'acacia': {
    text: 'Project Acacia, a research program of the RBA and the DFCRC, tested tokenised settlement across twenty use cases.',
    ev: {
      S1: 'the Reserve Bank’s and DFCRC\'s landmark research program Project Acacia tested tokenised settlement across twenty use cases.',
    },
  },
  'acacia-l1': {
    text: 'Redbelly says it was the only public Layer 1 carrying real central bank claims on public infrastructure in Project Acacia.',
    ev: {
      S1: 'As part of Project Acacia, the RBA issued its world-first pilot wholesale CBDC directly onto external platforms. … Redbelly, by contrast, was the only public Layer 1 carrying real central bank claims on public infrastructure.',
    },
  },
  'bond': {
    text: 'Tokeniser’s site states the network settled a tokenised corporate bond in the RBA’s pilot wholesale CBDC (central bank money).',
    ev: {
      S8: 'It has settled a tokenised corporate bond in the Reserve Bank of Australia\'s pilot wholesale CBDC as part of Project Acacia. … Central bank money settled in Project Acacia',
    },
  },
  'bd-tokeniser': {
    text: 'Banking Day describes Tokeniser as infrastructure for the origination, administration and lifecycle servicing of tokenised assets such as equities, notes and bonds, private credit, derivatives and commodities.',
    ev: {
      S4: 'Redbelly Network’s ‘Tokeniser’ product specialises in blockchain infrastructure that permits the origination, administration and end-to-end lifecycle servicing of tokenised assets traded in the capital markets, such as equities, notes and bonds, private credit, derivatives and commodities.',
    },
  },
  'gramoli': {
    text: 'Tokeniser is anchored in patented research led by Professor Vincent Gramoli at the University of Sydney and CSIRO (Australia’s government science agency); Gramoli is Redbelly’s founder and CTO.',
    ev: {
      S4: 'Tokeniser is anchored in patented research led by Professor Vincent Gramoli at the University of Sydney and CSIRO. Gramoli is Redbelly Network’s founder and CTO.',
      S8: 'developed from research at the University of Sydney and CSIRO, Australia\'s government science agency.',
    },
  },
  'tk-saas': {
    text: 'Tokeniser runs on Redbelly Network and is offered as SaaS for fund administration and investor portals.',
    ev: {
      S6: 'Tokeniser operates on Redbelly Network, Australia\'s public digital token infrastructure … SaaS for fund administration and investor portals.',
    },
  },
  'tk-compliance': {
    text: 'Tokeniser programs eligibility checks into each asset at protocol level, and products operate under the issuer’s existing licensing.',
    ev: {
      S6: 'Tokeniser programs eligibility into every asset at the protocol level: identity, KYC, AML, CTF, wholesale and sophisticated investor tests, and TMD. … Products issued through Tokeniser operate under an Asset Issuer\'s existing licensing.',
    },
  },
  'tk-sequence': {
    text: 'The site contrasts this with a traditional sequence of subscription, manual checks, payment, reconciliation and registry update.',
    ev: {
      S10: 'Traditional: Subscription → Manual checks → Payment → Reconciliation → Registry update. Tokeniser: One atomic transaction',
    },
  },
  'tk-api': {
    text: 'Tokeniser’s API and MCP let customers integrate it with an existing registry or build a custom investor portal.',
    ev: {
      S6: 'Our API and MCP let you integrate Tokeniser with your existing registry, or build a custom investor portal.',
    },
  },
  'tk-integrate': {
    text: 'Fund managers can keep their own investor experience, with Tokeniser running underneath via APIs.',
    ev: {
      S11: 'Connect your existing portal or application to Tokeniser through APIs. Retain your branding. Keep existing investor workflows. Use Tokeniser underneath for registry and digital asset infrastructure',
    },
  },
  'tk-figures': {
    text: 'Tokeniser reports A$1.2B in issued equity and funds, 160+ companies and funds and A$2B+ in transactions.',
    ev: {
      S6: 'A$1.2B issued equity & funds · 160+ companies and funds · A$2B+ transactions',
    },
  },
  'not-stated': {
    text: 'The announcement does not set out a product roadmap, timelines, leadership-team changes or named payment integrations.',
    ev: {
      S1: 'Checked against the full text: no roadmap, timeline, leadership-team change or named payment integration is stated.',
    },
  },
};

const BRIEFING = {
  kicker: 'Redbelly DAO · New CEO briefing',
  title: 'Christian Westerlind Wigstrom, Redbelly’s incoming CEO',
  subtitle: 'Who he is, what Redbelly announced, and what his payments track record could mean for Tokeniser',
  date: '29 October 2026',
  meta: `29 October 2026 · Sources accessed ${ACCESSED}`,
  howto: 'How to read this briefing: every factual statement carries a bracketed source link. Boxes marked ANALYSIS contain interpretation, not established fact. A claim-by-claim source list accompanies this document.',
  sections: [
    {
      h1: '1. Executive summary',
      blocks: [
        { p: 'Redbelly Network announced on 16 September 2026 that Christian Westerlind Wigstrom will become its Chief Executive Officer, starting November 2026 [[appointment:S1,S2,S3]]; Banking Day gives the start date as Monday 2 November 2026 [[start-date:S4]]. He co-founded the payments company Monoova and was its CEO for almost ten years, until 2026 [[cofounder:S1,S4,S5]]. Redbelly says he joins “to lead the company’s push into regulated tokenisation” [[push:S1,S3]], a strategy delivered through Tokeniser, which “brings fund and equity administration on-chain for regulated markets” [[tokeniser-onchain:S1]].' },
        { analysis: [
          'His record is in the cash side of finance: real-time payments connected to business software through APIs, with the matching of payments automated [[monoova-what:S12]]. Tokeniser exchanges cash and units in a single step [[tk-dvp:S9]]. The most direct fit for his experience is therefore the cash leg of tokenised transactions, distribution through partner platforms, and compliance built into the product (Section 4).',
        ] },
        { h2: 'Key terms' },
        { glossary: [
          ['NPP', 'New Payments Platform: the infrastructure for real-time payments in Australia, including PayID and PayTo payments [[npp:S12,S13]].'],
          ['PayID', 'An identifier such as an email address or phone number that replaces BSB and account numbers when paying [[payid:S12]].'],
          ['PayTo', 'Works “like a modern, real-time, direct debit”: the customer approves a digital agreement in their mobile or online banking, then the business can request payments that transfer instantly [[payto:S12]].'],
          ['API', 'A direct connection between software systems; in payments, “a single API integration connects real-time payments directly to an organisation’s software system” [[api:S13]].'],
          ['Reconciliation', 'Matching each incoming payment to the customer who made it; done manually, it relies on payment references [[recon:S13]].'],
          ['Tokenisation', 'Recording “ownership of financial products and services as digital tokens”, with the rules of the asset programmed in [[tokenisation:S6]].'],
          ['T+2 / T+0', 'Settlement two business days after a trade, as in listed funds, versus settlement at the point of trade [[tplus:S9]].'],
        ] },
      ],
    },
    {
      h1: '2. Professional background',
      blocks: [
        { h2: 'Monoova: co-founder and CEO, almost ten years to 2026' },
        { bullets: [
          'Monoova is a payment service provider. In his words, it specialises “in real-time payments and payments automation for businesses”, and its APIs let companies “tailor how they receive, manage and pay funds” [[monoova-what:S12]].',
          'According to Redbelly, by the end of his tenure Monoova had processed $200bn, transacting with more than 10% of all Australians by acting “behind the scenes” of other brands [[scale:S1]]. It became Australia’s largest PayTo processor, issued almost a quarter of the country’s PayIDs and won FinTech Australia’s Fintech Organisation of the Year [[payto-payid:S1]]. Clients included Wise and Carsales.com.au [[clients:S1]].',
          'Monoova was “one of a very small group of non-banks” enabled on the NPP [[nonbank:S15]].',
          'In an Australian Payments Plus (AP+) case study he argued that “if a real-time payment is only ‘noticed’ when someone logs on to their banking portal, the onward payment flow is not real-time” [[noticed:S13]]. Monoova’s “Automatcher” issues unique, repeat-use PayIDs so incoming payments can be reconciled without manual references [[automatcher:S13]].',
        ] },
        { h2: 'Industry roles' },
        { bullets: [
          'He has served on the boards of FinTech Australia and the Australian Payments Network (AusPayNet) [[boards:S1,S3]]: as Director and Treasurer of FinTech Australia [[fta-role:S5]] and as an Alternate Director of AusPayNet [[apn-role:S4,S5]].',
          'AusPayNet describes its role as including “facilitating self-regulation” and “coordinating system-wide standards” for the payments system, with more than 150 members and participants [[apn-about:S18]].',
        ] },
        { h2: 'Before Monoova' },
        { bullets: [
          'He holds a PhD from the University of Oxford [[phd:S14,S15,S17]]; his profile lists Oxford University for 2008 to 2012 [[oxford-dates:S5]]. As a doctoral student he worked with Robert Skidelsky “at the intersection of economic policy and theory” and co-edited _The Economic Crisis and the State of Economics_ (Palgrave Macmillan) [[inet:S16]].',
          'While completing the PhD he worked as an economic advisor and speechwriter in the UK Parliament, in the House of Lords [[parliament:S14,S15]].',
          'He then spent three years as Chief of Staff and Markets at a large agricultural startup in Zimbabwe [[zimbabwe:S14]], described elsewhere as an agriculture and renewable-energy company [[zim-energy:S15]] based in Harare [[zim-harare:S17]]. He has also consulted for firms in Iraq, Sweden, the US and the UK [[consulting:S15]].',
        ] },
      ],
    },
    {
      h1: '3. Redbelly and Tokeniser: what was announced',
      blocks: [
        { h2: 'Redbelly’s announcement' },
        { bullets: [
          'Redbelly says it has spent years building “rigorous, patented technology to support the management of regulated assets”, in collaboration with regulators and the scientific community [[patented:S1]]. It describes itself as “a Layer 1 blockchain built for regulated finance, with native identity and compliance” [[l1:S1]], and says its compliance work, including Public Digital Token Infrastructure (PDTI), is aimed at operating inside the licensed environment created by the Digital Assets Framework [[pdti:S1]].',
          'Redbelly ties the appointment to an idea from his Monoova years, that “payments infrastructure must be good enough to disappear into the background”, and says he is “applying that same thesis to regulated capital-markets infrastructure” [[thesis:S1]]. It positions itself as “the settlement layer for regulated markets, not just another chain chasing attention” [[settlement-layer:S1]].',
          'His quoted comments: “One of Redbelly’s many strengths is its regulatory credibility. In payments, I learnt that success belonged to the company that saw compliance as a product edge rather than a tick box.” [[q-credibility:S1]] And: “The next era of finance won’t be won by the loudest chain,” he said. “It’ll be won by the chain that institutions can actually use.” [[q-loudest:S1,S2]]',
        ] },
        { h2: 'The regulatory backdrop, as the sources describe it' },
        { bullets: [
          'The Corporations Amendment (Digital Assets Framework) Act brings digital-asset platforms and tokenised-custody platforms into the same licensing regime as brokers and fund managers [[daf:S1]]. It received Royal Assent on 8 April 2026 and commences on 9 April 2027 [[daf-dates:S7]].',
          'Project Acacia, a research program of the Reserve Bank of Australia (RBA) and the DFCRC, tested tokenised settlement across twenty use cases [[acacia:S1]]. Redbelly says it was “the only public Layer 1 carrying real central bank claims on public infrastructure” in the program [[acacia-l1:S1]], and Tokeniser’s site states the network settled a tokenised corporate bond in the RBA’s pilot wholesale CBDC (central bank money) [[bond:S8]].',
        ] },
        { h2: 'Tokeniser in brief' },
        { bullets: [
          'Banking Day describes Tokeniser as blockchain infrastructure for “the origination, administration and end-to-end lifecycle servicing of tokenised assets”, such as equities, notes and bonds, private credit, derivatives and commodities [[bd-tokeniser:S4]]. It is anchored in patented research led by Professor Vincent Gramoli at the University of Sydney and CSIRO, Australia’s government science agency; Gramoli is Redbelly’s founder and CTO [[gramoli:S4,S8]].',
          'Tokeniser runs on Redbelly Network and is offered as software (SaaS) for fund administration and investor portals [[tk-saas:S6]]. Eligibility checks, from identity, KYC and AML to wholesale and sophisticated investor tests, are programmed into each asset at protocol level, and products operate under the issuer’s existing licensing [[tk-compliance:S6]].',
          'On settlement, the site states that “cash and units are exchanged in a single step and the register updates simultaneously, or the transaction does not proceed”, a move from T+2 to T+0 settlement [[tk-dvp:S9]]. It contrasts this with a traditional sequence of subscription, manual checks, payment, reconciliation and registry update [[tk-sequence:S10]].',
          'Tokeniser’s “API and MCP” let customers integrate it with an existing registry or build a custom investor portal [[tk-api:S6]]. The site reports A$1.2B in issued equity and funds, 160+ companies and funds, and A$2B+ in transactions [[tk-figures:S6]].',
        ] },
      ],
    },
    {
      h1: '4. Strategic analysis: what his background could mean',
      intro: 'Each point below states its factual basis, with sources, and then gives the analysis. The analysis is interpretation by this briefing, not a statement by Redbelly or by Christian Westerlind Wigstrom, and it contains no price commentary or investment advice.',
      points: [
        {
          h2: '4.1 The cash leg is a payments problem',
          basis: 'Tokeniser exchanges cash and units in one step [[tk-dvp:S9]], removing the separate payment and reconciliation stages of a traditional registry [[tk-sequence:S10]]. Monoova specialised in real-time payments, automated reconciliation and API connections into client software [[monoova-what:S12]] [[automatcher:S13]].',
          analysis: 'The point where bank money meets the token register is where his experience applies most directly. Practical questions for the new leadership include how investors fund subscriptions and receive redemptions and distributions, which payment rails carry that money, and how cash movements reconcile against the register without manual work.',
        },
        {
          h2: '4.2 Infrastructure that sits behind other brands',
          basis: 'Monoova grew by operating behind other companies’ brands [[scale:S1]]. Tokeniser already offers API integration [[tk-api:S6]] and lets fund managers keep their own investor experience with Tokeniser running underneath [[tk-integrate:S11]].',
          analysis: 'A likely emphasis is distribution through partners, such as registries, fund administrators and investment platforms, that embed Tokeniser under their own brand. On that model, progress shows up as issuers, assets and transactions on Tokeniser rather than as public visibility of the network.',
        },
        {
          h2: '4.3 Compliance as a product feature: continuity, not a pivot',
          basis: 'He describes compliance as a product advantage rather than a formality [[q-credibility:S1]]. Tokeniser already programs eligibility checks into each asset [[tk-compliance:S6]], and the Digital Assets Framework commences on 9 April 2027 [[daf-dates:S7]].',
          analysis: 'The appointment reinforces Redbelly’s existing regulatory positioning rather than signalling a change of direction. The April 2027 commencement is the practical reference point for institutional readiness, partner integrations and product scope.',
        },
        {
          h2: '4.4 Industry standing',
          basis: 'He has served on the boards of FinTech Australia and AusPayNet [[boards:S1,S3]]. AusPayNet’s role includes facilitating self-regulation and coordinating system-wide standards [[apn-about:S18]].',
          analysis: 'That experience is relevant while tokenisation rules and market practice are still forming, and in building relationships with the banks and licensed intermediaries a regulated platform depends on.',
        },
        {
          h2: '4.5 Limits and open questions',
          basis: 'Redbelly presents the move as “that same thesis” applied to capital markets [[thesis:S1]]. The announcement does not set out a product roadmap, timelines, leadership-team changes or named payment integrations [[not-stated:S1]].',
          analysis: 'Payments and tokenised capital markets are different businesses, so whether the experience transfers is a hypothesis that results will test. Signals to watch once he starts on 2 November 2026 [[start-date:S4]]: payment or banking partners connected to Tokeniser; platforms integrating Tokeniser through its API; issuers and asset classes onboarded before April 2027; and Redbelly’s role in industry and standards forums.',
        },
      ],
    },
  ],
  footer: 'Informational only: no price commentary, investment advice or promises of returns.',
};

// X thread. Plain ASCII quotes for compatibility. URLs count as 23 characters on X.
const THREAD = [
  {
    text: 'Redbelly Network has named Christian Westerlind Wigstrom as its next CEO. The appointment was announced on 16 Sept 2026 and he starts in November.\n\nWho is he, and what could his track record mean for Tokeniser? A short, sourced thread.',
    sources: ['S1'],
    claims: ['appointment'],
  },
  {
    text: 'Career: co-founder of payments company Monoova, and its CEO for almost 10 years until 2026.\n\nIndustry roles: board of FinTech Australia, and Alternate Director at the Australian Payments Network (AusPayNet).',
    sources: ['S4'],
    claims: ['cofounder', 'apn-role'],
  },
  {
    text: 'Monoova by the end of his tenure, per Redbelly:\n- $200bn processed\n- transactions with more than 10% of Australians\n- Australia\'s largest PayTo processor\n- almost a quarter of the country\'s PayIDs issued\n\nClients included Wise and Carsales.com.au.',
    sources: ['S1'],
    claims: ['scale', 'payto-payid', 'clients'],
  },
  {
    text: 'His specialism is real-time payments plus automation. In his words, Monoova specialised "in real-time payments and payments automation for businesses", with APIs letting companies "tailor how they receive, manage and pay funds".',
    sources: ['S12'],
    claims: ['monoova-what'],
  },
  {
    text: 'Before fintech: a PhD at Oxford, work as an economic advisor and speechwriter in the UK Parliament, then three years as Chief of Staff and Markets at an agricultural startup in Zimbabwe.',
    sources: ['S14'],
    claims: ['phd', 'parliament', 'zimbabwe'],
  },
  {
    text: 'Redbelly says he joins "to lead the company\'s push into regulated tokenisation", delivered through Tokeniser.\n\n"The next era of finance won\'t be won by the loudest chain," he said. "It\'ll be won by the chain that institutions can actually use."',
    sources: ['S1'],
    claims: ['push', 'tokeniser-onchain', 'q-loudest'],
  },
  {
    text: 'Analysis (our read, not fact): Tokeniser swaps cash and fund units in one step, which makes the cash side a payments job, the specialism covered in 4/8. That cash leg, partner integrations via API and built-in compliance are where his record fits.',
    sources: ['S9'],
    claims: ['tk-dvp'],
  },
  {
    text: 'What to watch once he starts on 2 Nov (analysis): payment and banking partners for Tokeniser, platforms integrating it via API, and issuers onboarding before Australia\'s Digital Assets Framework commences on 9 Apr 2027.',
    sources: ['S4', 'S7'],
    claims: ['start-date', 'daf-dates'],
  },
];

module.exports = { ACCESSED, SOURCES, CLAIMS, BRIEFING, THREAD };

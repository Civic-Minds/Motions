# Roadmap

Motions is a civic-intelligence engine for Toronto City Council. This roadmap outlines the path from a voting record browser to a comprehensive accountability layer.

- **[Vision](./VISION.md)** — north star and long-term goals
- **[Product](./ROADMAP_PRODUCT.md)** — features, views, and UX improvements
- **[Data](./ROADMAP_DATA.md)** — pipeline improvements, new sources, and data quality
- **[Technical](./ROADMAP_TECHNICAL.md)** — code quality, bugs, and structural improvements

---

## Near-term priorities

- [ ] **Plain-language motion summaries** — AI-generated blurbs per motion making council decisions legible without a policy background. TMMIS scraper in progress to source agenda item text.
- [ ] **Advisory committee full vote breakdowns** — toronto.ca agenda item pages contain the full member list (including community appointees not in the Open Data CSV); scrape these to show complete votes for advisory committees
- [ ] **Ward digest email** — bi-weekly email summarizing your ward councillor's top votes, opt-in
- [ ] **"Who's responsible?" jurisdiction tool** — lets users search any issue and learn which level of government actually controls it, with relevant Toronto council votes surfaced

## Recently shipped

- [x] **Councillor card on ward detail pages** — every ward shows the councillor with photo and profile link; labels as "Your Councillor" on your own ward
- [x] **"Your Councillor" on councillors grid** — saved ward highlights the matching councillor card
- [x] **Vote history sort + outcome filter** — Impact/Date sort and All/YES/NO filter on councillor profiles

---

[Back to README](./README.md)

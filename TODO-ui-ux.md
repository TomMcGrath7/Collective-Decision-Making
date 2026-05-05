# TODO — UI / UX Improvements

Backlog of UI/UX improvements, ordered roughly by leverage (impact ÷ effort). Most are not blocked by anything else.

---

## High leverage (do these first)

- [ ] **Drag-and-drop ranking** — Voter ranking currently uses ↑/↓ arrow buttons only, despite the helper text saying "Drag or use arrows". On mobile, ranking 5 candidates by tapping arrows is painful. Use `dnd-kit` (preferred over `react-beautiful-dnd`, which is unmaintained).
- [ ] **Shareable URLs / permalinks** — Encode the full problem (problem type, candidates/agents, preferences, selected axioms, chosen mechanism) in the URL or a base64 query param. Killer feature for an educational tool: "send your classmate this exact scenario".
- [ ] **Mechanism comparison view on Results** — Side-by-side "if you'd used these other mechanisms with the same ballots, here's who would have won". The README already lists this as a feature; make sure it's prominent on the Results page, not buried.
- [ ] **localStorage persistence for in-progress problem** — Refresh currently wipes inputs. Auto-save the current session draft.
- [ ] **Visualisations on Results**:
  - [ ] Pairwise matrix (heatmap) for Condorcet / Schulze / Ranked Pairs.
  - [ ] Sankey or step diagram for IRV elimination rounds.
  - [ ] Stacked bar chart of claims vs awards for claims problems.
  - [ ] Bipartite graph for matching results.

---

## Inputs and flow

- [ ] **Bulk ballot entry** — Power users want to paste `3:A>B>C\n2:B>C>A` (multiplicity-prefixed Condorcet notation). Currently each voter is added individually.
- [ ] **Random / example fill** — One-click "fill with a random preference profile" and "load this textbook example" right on the input page (some examples exist; surface them better).
- [ ] **Candidate / agent reordering and renaming** — Verify there's an easy way to edit a candidate's name after creation.
- [ ] **Inline validation** — Highlight when a ranking is incomplete, when claims sum below the endowment in a non-claims problem, etc.
- [ ] **Keyboard-first ranking** — Focus a ranked item, then `Space` to grab + arrow keys to move (the standard accessible drag pattern). Pairs with the dnd-kit migration.
- [ ] **"Add 5 voters" / "Add row" bulk buttons** — Reduce click count for larger scenarios.

---

## Axiom selection page

- [ ] **Axiom categories as collapsible groups** — fairness / efficiency / strategy / informational. Long flat lists are intimidating.
- [ ] **"Why is this incompatible?" tooltips** — When a mechanism greys out, explain *which* axiom killed it on hover, not just that it failed something.
- [ ] **Impossibility theorem callouts** — If the user selects axioms whose combination is known impossible (Arrow, Gibbard–Satterthwaite, etc.), surface the named theorem with a link to the Learn More page.
- [ ] **"Show all axioms ↔ mechanisms" matrix view** — A read-only compatibility table is hugely valuable as a study tool.
- [ ] **Save / load axiom presets** — "Voter-friendly", "Strategy-proof only", "Classical Arrow set", etc.

---

## Results page

- [ ] **Step-by-step playback for IRV / Schulze** — A "next step" button rather than dumping all rounds at once.
- [ ] **Counterexample mode** — When a mechanism fails a selected axiom, show the *specific* preference perturbation that demonstrates the failure on this profile.
- [ ] **Export results** — PNG of the result + JSON of the inputs. Useful for class assignments and PRs/blog posts.
- [ ] **Confetti is fine but optional** — `canvas-confetti` is already a dependency; provide a toggle for users who find motion distracting (also accessibility/`prefers-reduced-motion`).

---

## Information architecture and copy

- [ ] **Glossary page** — Linked from any term used in tooltips. Currently axiom definitions are duplicated inline.
- [ ] **Per-mechanism deep dives** — Clicking a mechanism name goes to a detail page with: axioms satisfied/failed (with reasons), real-world examples, classic counterexamples, references.
- [ ] **Update the homepage hero copy** — Currently says "Voting Theory" in the secondary CTA, but the app now also covers fair division, claims, and matching. Should be "Learn About Decision Theory" or similar.
- [ ] **Problem-type icons in nav / breadcrumbs** — Easy at-a-glance reminder of which problem type the user is in.
- [ ] **Footer with citation block** — One-line BibTeX / APA so educators can cite the tool.

---

## Accessibility

- [ ] **Full keyboard support** — Confirm all flows work without a mouse. Especially the ranking interaction.
- [ ] **`prefers-reduced-motion` support** — Disable confetti and any non-essential animation.
- [ ] **Focus indicators** — Audit Tailwind defaults; the slate/blue palette can be low-contrast on focus rings.
- [ ] **Screen-reader labels for compatibility filtering** — When a mechanism greys out, announce *why*.
- [ ] **Colour-independent state** — Don't rely on green/red alone to indicate axiom satisfaction; use icons too (✓ / ✗).
- [ ] **WCAG AA contrast pass** — Audit `text-slate-500/600` against backgrounds.

---

## Mobile and responsive

- [ ] **Test the full flow at 375px width** — Rankings, matching preferences, and the Results visualisations are the most likely break points.
- [ ] **Bottom-sheet style for axiom selection on mobile** — Long sidebars + form inputs compete for vertical space.
- [ ] **Sticky "Continue" button on input pages** — Currently easy to lose below the fold once you've added several voters.

---

## Engineering polish

- [ ] **Unit tests for each mechanism** — At minimum: a known-textbook-example test per mechanism (Burlington 2009 for IRV, contested-garment for Talmud, etc.).
- [ ] **Axiom-property tests** — For each (mechanism, axiom) cell marked `true`, run randomised property tests to look for counterexamples; if any, the cell is wrong.
- [ ] **Replace `Math.max(...Object.values(scores))` patterns** — Stack-overflow risk at huge scale (not relevant here, but a code-quality note).
- [ ] **Strict TypeScript on the Results page** — `Results.tsx` has 550+ lines and uses `typeof votingMechanisms[0]` patterns that suggest weak typing of the result shape; consider explicit result-type unions.
- [ ] **Add a `404` route and a generic error boundary** — Standard polish.

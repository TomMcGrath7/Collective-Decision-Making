# TODO — Rules & Axioms

Backlog of mechanisms and axioms worth adding across the four problem types. Ordered roughly by pedagogical value.

---

## Voting

### Mechanisms
- [ ] **Ranked Pairs (Tideman)** — Condorcet method that locks in pairwise victories in order of margin, skipping any that would create a cycle. Companion to Schulze; satisfies clone independence and monotonicity.
- [ ] **Kemeny–Young** — Selects the ranking minimising total pairwise disagreement. Theoretically elegant (maximum likelihood under Condorcet's noise model), NP-hard in general; fine for small inputs.
- [ ] **STAR voting** (Score-Then-Automatic-Runoff) — 0–5 score ballots; top two by score advance to an automatic runoff using the same ballots. Real-world use in Oregon municipal advocacy.
- [ ] **Score / Range voting** — Cardinal ratings, sum or average wins. Distinct from Approval (which is binary) and Borda (which is positional).
- [ ] **Bucklin voting** — Successive-approval style: count first preferences; if no majority, add second preferences; etc. Historical use in US municipal elections.
- [ ] **Coombs method** — Like IRV but eliminates the candidate with the most *last*-place votes each round. Useful as a Condorcet-friendly contrast to IRV.
- [ ] **Two-round runoff** — Top-two general → head-to-head runoff. Distinct from IRV; very common in real-world elections (France, Brazil).

### Axioms
- [ ] **Smith criterion** — Winner must come from the smallest dominant set. Strengthens Condorcet; Schulze and Ranked Pairs satisfy it, Copeland does not strictly.
- [ ] **Schwartz criterion** — Weaker variant of Smith; useful when teaching the hierarchy of Condorcet strengthenings.
- [ ] **Later-no-harm** — Ranking another candidate lower can never hurt your top choice. Defining property of IRV's appeal.
- [ ] **Later-no-help** — Ranking another candidate lower can never help your top choice.
- [ ] **Clone independence** — Adding clones of an existing candidate doesn't change the winner. Distinguishes Schulze/RP from Borda and Plurality.
- [ ] **Independence of clones is distinct from IIA** — worth a side note in the explainer copy.
- [ ] **Resolvability** — Ties become vanishingly rare as the electorate grows.
- [ ] **Polynomial computability** — Honest separator: Kemeny is NP-hard, everything else here isn't. Worth flagging as a "practicality axiom".

---

## Claims problems

### Mechanisms
- [x] **Talmud rule (Aumann–Maschler)** — *implemented*.
- [ ] **Constrained Equal Losses (CEL)** — Dual of CEA. Each agent's loss `c_i − x_i` is equal subject to non-negative awards. Natural pairing with the existing CEA; together they're the building blocks of Talmud.
- [ ] **Random Arrival rule** — Average award across all permutations of arrival order, where each arriving agent claims `min(c_i, remaining)`. Equals the Shapley value of the bankruptcy game; great teaching link to cooperative game theory.
- [ ] **Adjusted Proportional rule** — Each agent first receives the minimal right `max(0, E − Σ_{j≠i} c_j)`, then the rest is split proportionally on the residual claims.
- [ ] **Piniles' rule** — Variant of Talmud using full claims rather than half-claims in one of the two regimes.
- [ ] **Minimal Overlap rule** — O'Neill's rule based on overlapping claim intervals.

### Axioms
- [ ] **Order preservation** — `c_i ≥ c_j ⇒ x_i ≥ x_j` *and* `c_i − x_i ≥ c_j − x_j`. Basic monotonicity property; satisfied by all reasonable rules.
- [ ] **Self-duality** — Treating gains and losses symmetrically gives the same answer. Uniquely characterises the Talmud rule (with consistency).
- [ ] **Consistency (Thomson)** — If a subgroup re-applies the rule to their combined awards, the result is unchanged. Central axiom in the bankruptcy literature.
- [ ] **Composition up / Composition down** — Splitting the endowment into stages and re-applying the rule yields the same final awards.
- [ ] **Resource monotonicity** — Increasing the endowment never decreases anyone's award.
- [ ] **Equal treatment of equals** — Equal claims ⇒ equal awards. Trivial but worth stating.

---

## Fair division

### Mechanisms
- [ ] **Selfridge–Conway** — Discrete envy-free protocol for 3 players. Famous and pedagogically iconic.
- [ ] **Even–Paz** — n-player proportional protocol with O(n log n) cuts. Efficient and worth contrasting against the moving-knife.
- [ ] **Maximum Nash Welfare** — Allocation maximising the product of utilities. EF1 + Pareto-efficient for indivisible goods.
- [ ] **Round-robin** — Agents take turns picking their favourite remaining good. EF1, simple, surprisingly effective baseline.
- [ ] **Envy-Cycle Elimination** — Allocates indivisible goods one at a time while resolving envy cycles. Guarantees EF1.
- [ ] **Austin's moving-knife procedure** — Exact (not just proportional) two-player division.

### Axioms
- [ ] **EF1 (Envy-Free up to one good)** — Modern relaxation for indivisible items: any envy can be eliminated by removing one item from the envied bundle.
- [ ] **EFX (Envy-Free up to any good)** — Stronger: removing *any* one good from the envied bundle removes envy. Open whether always achievable for ≥4 agents.
- [ ] **MMS (Maximin share)** — Each agent gets at least what they could guarantee themselves by partitioning into n bundles and taking the worst.
- [ ] **Proportionality up to one good (Prop1)** — Indivisible-goods analogue of proportionality.
- [ ] **Resource monotonicity** — Adding goods doesn't hurt anyone.
- [ ] **Population monotonicity** — Adding an agent doesn't increase anyone else's allocation.

---

## Matching

### Mechanisms
- [ ] **Boston mechanism (Immediate Acceptance)** — Pedagogically critical *bad* example: not strategy-proof, replaced by Deferred Acceptance in many cities.
- [ ] **Probabilistic Serial (PS)** — Eating algorithm; produces ordinally efficient and envy-free random assignments.
- [ ] **Hungarian algorithm** — Optimal one-to-one matching under cardinal utilities (assignment problem).
- [ ] **Top Trading Cycle with endowments and chains** — Kidney-exchange variant.
- [ ] **Gale–Shapley with ties / incomplete lists** — Real-world variants used in school choice and medical matching.

### Axioms
- [ ] **Ordinal efficiency** — No alternative random assignment first-order stochastically dominates the chosen one.
- [ ] **Rank efficiency** — Stronger than ordinal efficiency.
- [ ] **Envy-freeness in matching** — Distinct from the fair-division version; useful for school choice.
- [ ] **Group strategy-proofness** — No coalition can jointly misreport to all gain.
- [ ] **Respecting priorities** — School-choice axiom: no student "justifiably envies" another.
- [ ] **Bossiness / non-bossiness** — Whether one agent's report can change another's outcome without changing their own.

---

## Cross-cutting / framework

- [ ] **Tagging axioms by category** — fairness / efficiency / strategy / informational. Some axioms already have a `category` field — ensure all new ones do, and surface it in the UI as a filter.
- [ ] **Impossibility theorem callouts** — when a user selects a combination known to be impossible (e.g. Condorcet + IIA + non-dictatorship for ≥3 candidates), surface a named theorem rather than just an empty result set.
- [ ] **Per-axiom counterexample pages** — for each "mechanism fails axiom X" cell, link to a minimal preference profile demonstrating the failure.

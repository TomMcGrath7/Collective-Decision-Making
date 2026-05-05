# Collective Decision Making

An educational web application for exploring **collective decision-making** mechanisms across four problem types — voting, claims problems, fair division, and matching. The tool helps groups understand how different mechanisms work, why they produce different outcomes, and the fundamental trade-offs in mechanism design.

🌐 **Live app:** https://tommcgrath7.github.io/Collective-Decision-Making/

## Features

- **Four problem types** in one tool: voting, claims problems, fair division, and matching
- **Interactive simulations**: run any supported mechanism with your own inputs
- **Axiom Explorer**: pick the fairness properties that matter to you and see which mechanisms satisfy them
- **Real-time compatibility filtering**: incompatible mechanisms grey out as you select axioms
- **Pre-loaded scenarios** from the literature (Burlington 2009, Condorcet Paradox, classic bankruptcy examples, etc.)
- **Step-by-step explanations** for every result
- **Privacy-first**: every calculation runs on-device — no backend, no voter data ever sent anywhere
- **Learn More** pages covering Arrow's Impossibility Theorem and Gibbard–Satterthwaite

## Problem types and mechanisms

### 🗳️ Voting

Pick a single winner from a set of candidates based on voter preferences.

| Mechanism | Description | Real-world examples |
|-----------|-------------|---------------------|
| **Plurality** | Each voter picks one candidate; most votes wins | UK Parliament, US Congress |
| **Borda Count** | Points awarded by ranking position | Eurovision, AP College Football Poll |
| **IRV (Instant Runoff)** | Eliminate lowest candidate each round | Australian elections, NYC, Academy Awards |
| **Approval Voting** | Approve any number of candidates | UN Secretary-General straw polls, Fargo ND |
| **Condorcet (Copeland)** | Most head-to-head matchup wins | Debian, Wikimedia elections |

### 📊 Claims Problems

Divide a limited endowment among agents whose total claims exceed what's available (bankruptcy, estate division, budget shortfalls).

| Mechanism | Description |
|-----------|-------------|
| **Proportional Rule** | Awards proportional to claims |
| **Constrained Equal Awards** | Equal awards subject to claim caps |
| **Weighted Proportional Rule** | Proportional with agent weights |

### 🍰 Fair Division

Divide a heterogeneous good among agents who may value parts differently (cake-cutting, estate division, splitting rent).

| Mechanism | Description |
|-----------|-------------|
| **Cut-and-Choose** | Classic two-player envy-free protocol |
| **Moving Knife (Dubins–Spanier)** | Continuous proportional protocol |
| **Adjusted Winner** | Two-party allocation of multiple goods |

### 🔗 Matching

Assign agents to each other or to resources based on preferences (roommates, school choice, job assignment).

| Mechanism | Description |
|-----------|-------------|
| **Gale–Shapley (Deferred Acceptance)** | Stable two-sided matching |
| **Top Trading Cycle (TTC)** | Pareto-efficient object reallocation |
| **Serial Dictatorship** | Agents pick in fixed order |
| **Random Serial Dictatorship** | Agents pick in randomised order |

## Fairness axioms

The app covers axioms across all four problem types:

**Voting (12):** Majority Criterion · Condorcet Winner · Condorcet Loser · Pareto Efficiency · Monotonicity · Independence of Irrelevant Alternatives · Anonymity · Neutrality · Participation · Consistency · Reversal Symmetry · Strategyproofness

**Claims Problems (7):** Proportionality · Pareto Efficiency · Envy-Freeness · Share Guarantee · Exhaustion of Endowment · Equal Awards Priority · Strategy-Proofness

**Fair Division (5):** Proportionality · Envy-Freeness · Equitability · Pareto Efficiency · Strategy-Proofness

**Matching (6):** Stability · Pareto Efficiency · Strategy-Proofness · Individual Rationality · Ex-ante Fairness · Non-wastefulness

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/TomMcGrath7/Collective-Decision-Making.git
cd Collective-Decision-Making
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

### Deployment

The app deploys automatically to GitHub Pages from `main` via `.github/workflows/deploy.yml`.

## Technical Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- All calculations run **entirely on-device** (no backend required)

## Academic Background

This application is grounded in social choice theory and cooperative game theory.

### Key References

- Arrow, K. J. (1951). *Social Choice and Individual Values*. Wiley.
- Gibbard, A. (1973). "Manipulation of voting schemes: a general result." *Econometrica*, 41(4), 587–601.
- Satterthwaite, M. A. (1975). "Strategy-proofness and Arrow's conditions." *Journal of Economic Theory*, 10(2), 187–217.
- Sen, A. K. (1970). *Collective Choice and Social Welfare*. Holden-Day.
- Moulin, H. (1988). *Axioms of Cooperative Decision Making*. Cambridge University Press.
- Gale, D. & Shapley, L. (1962). "College admissions and the stability of marriage." *American Mathematical Monthly*, 69(1), 9–15.
- Aumann, R. J. & Maschler, M. (1985). "Game theoretic analysis of a bankruptcy problem from the Talmud." *Journal of Economic Theory*, 36(2), 195–213.
- Brams, S. J. & Taylor, A. D. (1996). *Fair Division: From Cake-Cutting to Dispute Resolution*. Cambridge University Press.

### Further Reading

- [Stanford Encyclopedia of Philosophy: Voting Methods](https://plato.stanford.edu/entries/voting-methods/)
- [Stanford Encyclopedia of Philosophy: Arrow's Theorem](https://plato.stanford.edu/entries/arrows-theorem/)
- [Electowiki](https://electowiki.org/)

## Educational Use

This tool is designed for:

- **Students** learning about social choice theory and cooperative game theory
- **Educators** teaching voting theory, fair division, matching, and mechanism design
- **Groups** who want to understand how their chosen decision rule works
- **Researchers** exploring axiomatic trade-offs

## Privacy

- All calculations happen in your browser
- No voter, claimant, or preference data is ever sent to any server
- Optional anonymous analytics track only aggregate usage patterns

## Contributing

Contributions are welcome — issues and pull requests both.

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built to demonstrate that there is no "perfect" decision mechanism, only trade-offs.*

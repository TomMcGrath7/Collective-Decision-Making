# Collective Decision Making

An educational web application for exploring voting theory and collective decision-making mechanisms. This tool helps groups understand how different voting systems work, why they produce different outcomes, and the fundamental trade-offs in mechanism design.

## Features

- **Interactive Voting Simulations**: Run elections using 5 different voting mechanisms
- **Axiom Explorer**: Learn about fairness properties and see which mechanisms satisfy them
- **Real-Time Filtering**: Select desired axioms and see which mechanisms are compatible
- **What-If Comparisons**: Compare how different mechanisms would produce different winners with the same preferences
- **Educational Examples**: Pre-loaded famous scenarios from voting theory (Burlington 2009, Condorcet Paradox, etc.)
- **Learn More**: In-depth explanations of Arrow's Impossibility Theorem and Gibbard-Satterthwaite Theorem

## Voting Mechanisms

| Mechanism | Description | Real-World Examples |
|-----------|-------------|---------------------|
| **Plurality** | Each voter picks one candidate; most votes wins | UK Parliament, US Congress |
| **Borda Count** | Points awarded by ranking position | Eurovision, AP College Football Poll |
| **IRV (Instant Runoff)** | Eliminate lowest candidate each round | Australian elections, NYC, Academy Awards |
| **Approval Voting** | Approve any number of candidates | UN Secretary-General straw polls, Fargo ND |
| **Condorcet (Copeland)** | Who wins the most head-to-head matchups | Debian, Wikimedia elections |

## Fairness Axioms

The app covers 12 key axioms from social choice theory:

- **Majority Criterion**: Majority favorite wins
- **Condorcet Winner**: Beats all others head-to-head
- **Condorcet Loser**: Never elect who loses all head-to-head
- **Pareto Efficiency**: Unanimous preferences respected
- **Monotonicity**: Ranking higher never hurts
- **Independence of Irrelevant Alternatives (IIA)**: Third candidates don't affect A vs B
- **Anonymity**: All voters count equally
- **Neutrality**: All candidates treated equally
- **Participation**: Voting never hurts your preferred outcome
- **Consistency**: Combining electorates preserves winners
- **Reversal Symmetry**: Reversing all ballots reverses the winner
- **Strategyproofness**: No incentive to vote dishonestly

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/TomMcGrath7/Collective-Decision-Making.git
cd Collective-Decision-Making

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview  # Preview the production build
```

## Technical Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- All calculations run **entirely on-device** (no backend required)

## Academic Background

This application is grounded in social choice theory research:

### Key References

- Arrow, K. J. (1951). *Social Choice and Individual Values*. Wiley.
- Gibbard, A. (1973). "Manipulation of voting schemes: a general result." *Econometrica*, 41(4), 587-601.
- Satterthwaite, M. A. (1975). "Strategy-proofness and Arrow's conditions." *Journal of Economic Theory*, 10(2), 187-217.
- Sen, A. K. (1970). *Collective Choice and Social Welfare*. Holden-Day.
- Moulin, H. (1988). *Axioms of Cooperative Decision Making*. Cambridge University Press.

### Further Reading

- [Stanford Encyclopedia of Philosophy: Voting Methods](https://plato.stanford.edu/entries/voting-methods/)
- [Stanford Encyclopedia of Philosophy: Arrow's Theorem](https://plato.stanford.edu/entries/arrows-theorem/)
- [Electowiki](https://electowiki.org/)

## Educational Use

This tool is designed for:

- **Students** learning about social choice theory
- **Educators** teaching voting theory and mechanism design
- **Groups** who want to understand how their voting method works
- **Researchers** exploring voting theory concepts

## Privacy

- All calculations happen in your browser
- No voter data is ever sent to any server
- Optional anonymous analytics track only aggregate usage patterns

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

*Built to demonstrate that there is no "perfect" voting system, only trade-offs.*

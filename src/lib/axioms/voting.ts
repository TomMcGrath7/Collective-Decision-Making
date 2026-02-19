import type { Axiom } from '../../types';

export const votingAxioms: Axiom[] = [
  {
    id: 'pareto-efficiency',
    name: 'Pareto Efficiency',
    description:
      'If every voter prefers candidate A to candidate B, then B should not win.',
    plainLanguage:
      'A universally disliked option should never win. If everyone agrees X is better than Y, then Y cannot be the winner.',
    formalDefinition:
      'A mechanism is Pareto efficient if it never selects an outcome x when there exists another outcome y such that all voters weakly prefer y and at least one strictly prefers y.',
    category: 'efficiency',
    applicableTo: ['voting', 'claims', 'fair-division'],
  },
  {
    id: 'condorcet-winner',
    name: 'Condorcet Winner Criterion',
    description:
      'If a candidate would beat every other candidate in a head-to-head matchup, that candidate should win.',
    plainLanguage:
      'The "beats everyone" candidate should win. If one option would win against any other in a 1-on-1 vote, it should be the overall winner.',
    formalDefinition:
      'If there exists a candidate c such that for all other candidates d, a majority of voters prefer c to d, then c must be selected.',
    tradeoffWarning:
      'Only Condorcet/Copeland methods satisfy this. Selecting this eliminates Plurality, Borda, IRV, and Approval Voting.',
    category: 'efficiency',
    applicableTo: ['voting'],
  },
  {
    id: 'condorcet-loser',
    name: 'Condorcet Loser Criterion',
    description:
      'If a candidate would lose to every other candidate in a head-to-head matchup, that candidate should not win.',
    plainLanguage:
      'The "loses to everyone" candidate should never win. If one option would lose against any other in a 1-on-1 vote, it cannot be the winner.',
    formalDefinition:
      'If there exists a candidate c such that for all other candidates d, a majority of voters prefer d to c, then c must not be selected.',
    category: 'efficiency',
    applicableTo: ['voting'],
  },
  {
    id: 'anonymity',
    name: 'Anonymity',
    description:
      "The outcome depends only on the votes cast, not on who cast them. Swapping two voters' ballots doesn't change the result.",
    plainLanguage:
      'All voters are equal. It doesn\'t matter who submitted which ballot - only the content of the votes matters.',
    formalDefinition:
      'For any permutation π of voters, f(v₁, v₂, ..., vₙ) = f(v_{π(1)}, v_{π(2)}, ..., v_{π(n)}).',
    category: 'fairness',
    applicableTo: ['voting'],
  },
  {
    id: 'neutrality',
    name: 'Neutrality',
    description:
      "All candidates are treated equally. The rule doesn't favor any candidate based on their name or position.",
    plainLanguage:
      'All options are equal. No candidate has a built-in advantage based on their name, ballot position, or other identifier.',
    formalDefinition:
      'For any permutation σ of candidates, if σ is applied to all ballots, then σ is applied to the outcome.',
    category: 'fairness',
    applicableTo: ['voting'],
  },
  {
    id: 'majority',
    name: 'Majority Criterion',
    description:
      'If more than half of voters rank a candidate first, that candidate should win.',
    plainLanguage:
      'A true majority winner should win. If over 50% of voters put the same option first, that option must win.',
    formalDefinition:
      'If candidate c is ranked first by more than n/2 voters, then c must be selected.',
    tradeoffWarning:
      'Borda Count and Approval Voting do not satisfy this criterion.',
    category: 'fairness',
    applicableTo: ['voting'],
  },
  {
    id: 'strategyproofness',
    name: 'Strategyproofness',
    description:
      'Voters can never benefit by voting dishonestly. Submitting your true preferences is always optimal.',
    plainLanguage:
      'Honest voting is always best. You can never get a better result by lying about your preferences.',
    formalDefinition:
      'For all voters i and all preference profiles, voter i cannot obtain a strictly better outcome by misreporting their preferences.',
    tradeoffWarning:
      'By the Gibbard-Satterthwaite theorem, no non-dictatorial voting rule with 3+ candidates is fully strategyproof for ranked ballots.',
    category: 'strategy',
    applicableTo: ['voting', 'claims', 'fair-division'],
  },
  {
    id: 'monotonicity',
    name: 'Monotonicity',
    description:
      'If a winning candidate gains support (moves up in some rankings), they should still win.',
    plainLanguage:
      'More support should never hurt. If a candidate is winning and some voters rank them higher, they should still win.',
    formalDefinition:
      'If candidate c wins and some voters raise c in their ranking without changing the relative order of other candidates, then c still wins.',
    tradeoffWarning:
      'IRV (Instant Runoff Voting) famously violates this - ranking a candidate higher can cause them to lose!',
    category: 'monotonicity',
    applicableTo: ['voting'],
  },
  {
    id: 'independence-irrelevant-alternatives',
    name: 'Independence of Irrelevant Alternatives (IIA)',
    description:
      'The relative ranking of two candidates should depend only on how voters rank those two candidates, not on other candidates.',
    plainLanguage:
      'Other options shouldn\'t matter. Whether A beats B should only depend on how voters rank A vs B, not how they feel about C.',
    formalDefinition:
      'If the winner is c over d, and some voters change their ranking of other candidates (but not c vs d), then c still beats d.',
    tradeoffWarning:
      "By Arrow's Impossibility Theorem, no ranked voting method satisfies IIA. This axiom eliminates ALL mechanisms.",
    category: 'consistency',
    applicableTo: ['voting'],
  },
  {
    id: 'participation',
    name: 'Participation',
    description:
      'No voter should be worse off by participating. Abstaining should never help you.',
    plainLanguage:
      'Voting should never backfire. Casting a sincere vote should never make the outcome worse for you than not voting at all.',
    formalDefinition:
      'For any voter i, the outcome when i votes sincerely is at least as good for i as the outcome when i abstains.',
    tradeoffWarning:
      'IRV and Condorcet methods can violate this - your vote can hurt your preferred candidate!',
    category: 'strategy',
    applicableTo: ['voting'],
  },
  {
    id: 'consistency',
    name: 'Consistency',
    description:
      'If the electorate is divided into groups and a candidate wins in both groups, they should win overall.',
    plainLanguage:
      'Combining groups should be predictable. If candidate X wins in Group A and wins in Group B, then X should win when A and B vote together.',
    formalDefinition:
      'If c wins in electorate A and c wins in electorate B, then c wins in the combined electorate A ∪ B.',
    tradeoffWarning:
      'IRV and Condorcet methods do not satisfy consistency.',
    category: 'consistency',
    applicableTo: ['voting'],
  },
  {
    id: 'reversal-symmetry',
    name: 'Reversal Symmetry',
    description:
      'If all voters reverse their rankings, a previous non-winner should not become the unique winner.',
    plainLanguage:
      'Flipping all preferences should flip results. If everyone reverses their rankings, the original winner shouldn\'t suddenly become the loser.',
    formalDefinition:
      'If c is the unique winner, and all ballots are reversed, then c is not the unique winner of the reversed election.',
    category: 'consistency',
    applicableTo: ['voting'],
  },
];

export function getAxiomById(id: string): Axiom | undefined {
  return votingAxioms.find((a) => a.id === id);
}

export function getAxiomsByCategory(category: Axiom['category']): Axiom[] {
  return votingAxioms.filter((a) => a.category === category);
}

/**
 * Get axioms that would eliminate all remaining mechanisms if selected
 */
export function getRestrictiveAxioms(
  currentAxioms: string[],
  compatibleMechanismCount: (axioms: string[]) => number
): string[] {
  return votingAxioms
    .filter((axiom) => !currentAxioms.includes(axiom.id))
    .filter((axiom) => compatibleMechanismCount([...currentAxioms, axiom.id]) === 0)
    .map((a) => a.id);
}

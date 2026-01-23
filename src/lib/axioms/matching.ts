import type { Axiom } from '../../types';

export const matchingAxioms: Axiom[] = [
  // Stability
  {
    id: 'stability',
    name: 'Stability',
    description:
      'No pair of agents would prefer to leave their current matches for each other.',
    plainLanguage:
      'No two people would both be happier if they switched to be matched with each other instead of their current partners. There are no "blocking pairs" who would mutually prefer each other.',
    formalDefinition:
      'A matching M is stable if there exists no pair (a, b) such that a prefers b over M(a) and b prefers a over M(b).',
    category: 'fairness',
    applicableTo: ['matching'],
  },
  // Pareto Efficiency
  {
    id: 'pareto-efficiency-matching',
    name: 'Pareto Efficiency',
    description:
      'No reallocation can make one agent better off without making another worse off.',
    plainLanguage:
      'The matching is optimal - there is no way to reassign people that would make someone happier without making someone else less happy.',
    formalDefinition:
      'A matching M is Pareto efficient if there exists no other matching M\' where some agent strictly prefers M\' and no agent strictly prefers M.',
    category: 'efficiency',
    applicableTo: ['matching'],
  },
  // Strategy-proofness
  {
    id: 'strategy-proofness-matching',
    name: 'Strategy-proofness',
    description:
      'No agent can benefit by misreporting their preferences.',
    plainLanguage:
      'Honesty is the best policy. You cannot get a better match by lying about your preferences - being truthful always gives you the best possible outcome.',
    formalDefinition:
      'A mechanism is strategy-proof if for all agents i, reporting true preferences P_i is a dominant strategy: M(P_i, P_{-i}) is weakly preferred to M(P\'_i, P_{-i}) for all P\'_i.',
    tradeoffWarning:
      'In two-sided matching, full strategy-proofness for both sides is impossible. Gale-Shapley is only strategy-proof for the proposing side.',
    category: 'strategy',
    applicableTo: ['matching'],
  },
  // Individual Rationality
  {
    id: 'individual-rationality',
    name: 'Individual Rationality',
    description:
      'Every matched agent prefers their match to being unmatched.',
    plainLanguage:
      'Nobody is forced into a match they would rather not have. Everyone who is matched is at least as happy as if they had stayed single.',
    formalDefinition:
      'A matching M is individually rational if for all matched agents a, a weakly prefers M(a) to being unmatched.',
    category: 'fairness',
    applicableTo: ['matching'],
  },
  // Ex-ante Fairness
  {
    id: 'ex-ante-fairness',
    name: 'Ex-ante Fairness',
    description:
      'Equal expected outcomes before randomization (for randomized mechanisms).',
    plainLanguage:
      'When randomness is involved, everyone has an equal chance of getting good outcomes before the random choices are made. The lottery is fair even if the final result differs.',
    formalDefinition:
      'A randomized mechanism is ex-ante fair if each agent has equal probability of receiving any given rank in their preference list.',
    category: 'fairness',
    applicableTo: ['matching'],
  },
  // Non-wastefulness
  {
    id: 'non-wastefulness',
    name: 'Non-wastefulness',
    description:
      'No agent prefers an unfilled slot to their current assignment.',
    plainLanguage:
      'No seat goes empty while someone who wants it is left out. If there are available spots that someone prefers, they should get one.',
    formalDefinition:
      'A matching M is non-wasteful if for all agents a and positions p with unfilled capacity, if a prefers p to M(a) then a is assigned to p.',
    category: 'efficiency',
    applicableTo: ['matching'],
  },
];

export function getMatchingAxiomById(id: string): Axiom | undefined {
  return matchingAxioms.find((a) => a.id === id);
}

export function getMatchingAxiomsByCategory(category: Axiom['category']): Axiom[] {
  return matchingAxioms.filter((a) => a.category === category);
}

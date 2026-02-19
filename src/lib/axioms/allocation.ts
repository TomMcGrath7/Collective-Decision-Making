import type { Axiom } from '../../types';

export const allocationAxioms: Axiom[] = [
  // Standard Claims-Problem Axioms
  {
    id: 'proportionality-alloc',
    name: 'Proportionality',
    description:
      'Each claimant receives an award at least proportional to their claim relative to total claims, scaled by the available endowment.',
    plainLanguage:
      'Fair shares by entitlement. Each claimant receives an award in proportion to what they are owed — larger claims yield larger awards.',
    formalDefinition:
      'For n claimants with claims c_1, ..., c_n and endowment E: claimant i receives x_i = (c_i / sum(c_j)) * E when E < sum(c_j).',
    category: 'fairness',
    applicableTo: ['claims'],
  },
  {
    id: 'pareto-efficiency-alloc',
    name: 'Pareto Efficiency',
    description:
      'No reallocation of the endowment can make one claimant better off without making another worse off.',
    plainLanguage:
      'No waste. The division of the endowment is optimal — there is no way to give one claimant more without reducing another\'s award.',
    formalDefinition:
      'There exists no alternative award vector (x\'_1, ..., x\'_n) where x\'_i >= x_i for all i, with strict inequality for some i.',
    category: 'efficiency',
    applicableTo: ['claims'],
  },
  {
    id: 'envy-freeness-alloc',
    name: 'Envy-Freeness',
    description:
      'No claimant prefers another claimant\'s award to their own.',
    plainLanguage:
      'No jealousy. Every claimant is satisfied with their award — nobody wishes they had received someone else\'s share instead.',
    formalDefinition:
      'For all claimants i and j: claimant i values their award x_i at least as much as x_j.',
    tradeoffWarning:
      'With heterogeneous claims, envy-freeness may not always be achievable while satisfying other desiderata.',
    category: 'fairness',
    applicableTo: ['claims'],
  },
  // Claims-Specific Axioms
  {
    id: 'share-guarantee',
    name: 'Share Guarantee',
    description:
      'Each claimant receives a minimum guaranteed award regardless of other claimants\' entitlements.',
    plainLanguage:
      'Baseline protection. Even when others hold large claims, every claimant is guaranteed a minimum share of the endowment.',
    formalDefinition:
      'For claimant i with weight w_i in a system with total weight W and endowment E: x_i >= (w_i/W) * E, regardless of other claimants\' demands.',
    category: 'fairness',
    applicableTo: ['claims'],
  },
  {
    id: 'work-conservation',
    name: 'Exhaustion of Endowment',
    description:
      'The entire endowment is distributed — no resources are left unawarded when there are unsatisfied claims.',
    plainLanguage:
      'Distribute everything. As long as some claimant is not fully satisfied, the endowment is fully exhausted.',
    formalDefinition:
      'If sum(claims) > 0 and sum(awards) < E, then for some claimant i: x_i < c_i and x_i increases until E is fully allocated.',
    category: 'efficiency',
    applicableTo: ['claims'],
  },
  {
    id: 'max-min-fairness-axiom',
    name: 'Equal Awards Priority',
    description:
      'Maximise the minimum award any claimant receives before improving larger awards.',
    plainLanguage:
      'Help the worst-off first. The rule prioritises improving the smallest awards before giving more to those who already have larger shares.',
    formalDefinition:
      'An award vector is equal-awards optimal if for each claimant i, x_i cannot be increased without decreasing x_j for some claimant j where x_j <= x_i.',
    category: 'fairness',
    applicableTo: ['claims'],
  },
  {
    id: 'strategyproofness',
    name: 'Strategy-Proofness',
    description:
      'Claimants cannot benefit by misreporting their entitlement or claim size.',
    plainLanguage:
      'Honesty pays. No claimant can obtain a larger award by inflating or deflating their reported claim — truthful reporting is always optimal.',
    formalDefinition:
      'For all claimants i, reporting true claim c_i is a dominant strategy: the award under truthful reporting is at least as good as under any misreport c\'_i.',
    tradeoffWarning:
      'Perfect strategy-proofness can conflict with efficiency in some claims-problem rules.',
    category: 'strategy',
    applicableTo: ['claims'],
  },
];

export function getAllocationAxiomById(id: string): Axiom | undefined {
  return allocationAxioms.find((a) => a.id === id);
}

export function getAllocationAxiomsByCategory(category: Axiom['category']): Axiom[] {
  return allocationAxioms.filter((a) => a.category === category);
}

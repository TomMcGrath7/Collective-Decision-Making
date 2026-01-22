import type { Axiom } from '../../types';

export const allocationAxioms: Axiom[] = [
  // Standard Axioms (adapted for resource allocation)
  {
    id: 'proportionality-alloc',
    name: 'Proportionality',
    description:
      'Each agent receives at least 1/n of the total resource (where n is the number of agents).',
    plainLanguage:
      'Everyone gets their fair share. With n people sharing, each person is guaranteed at least 1/n of the total resource.',
    formalDefinition:
      'For n agents sharing resource R, agent i receives allocation x_i where x_i >= R/n.',
    category: 'fairness',
    applicableTo: ['allocation'],
  },
  {
    id: 'pareto-efficiency-alloc',
    name: 'Pareto Efficiency',
    description:
      'No reallocation can make one agent better off without making another worse off.',
    plainLanguage:
      'No waste. The allocation is optimal - there\'s no way to give someone more without taking from someone else.',
    formalDefinition:
      'There exists no alternative allocation (x\'_1, ..., x\'_n) where x\'_i >= x_i for all i, with strict inequality for some i.',
    category: 'efficiency',
    applicableTo: ['allocation'],
  },
  {
    id: 'envy-freeness-alloc',
    name: 'Envy-Freeness',
    description:
      'No agent prefers another agent\'s allocation to their own.',
    plainLanguage:
      'No jealousy. Everyone is satisfied with what they got - nobody wishes they had someone else\'s share instead.',
    formalDefinition:
      'For all agents i and j: agent i values their allocation x_i at least as much as x_j.',
    tradeoffWarning:
      'With different demands, envy-freeness may not always be achievable while satisfying other constraints.',
    category: 'fairness',
    applicableTo: ['allocation'],
  },
  // Resource-Specific Axioms
  {
    id: 'share-guarantee',
    name: 'Share Guarantee',
    description:
      'Each agent receives a minimum guaranteed share regardless of other agents\' demands.',
    plainLanguage:
      'Baseline protection. Even if others demand a lot, you\'re guaranteed a minimum amount of the resource.',
    formalDefinition:
      'For agent i with weight w_i in a system with total weight W: x_i >= (w_i/W) * R, regardless of other agents\' demands.',
    category: 'fairness',
    applicableTo: ['allocation'],
  },
  {
    id: 'work-conservation',
    name: 'Work Conservation',
    description:
      'No resource is left unallocated if there is still demand for it.',
    plainLanguage:
      'Use it all. If someone wants more and there\'s resource available, it gets allocated - nothing sits idle.',
    formalDefinition:
      'If sum(demands) > 0 and sum(allocations) < R, then for some agent i: x_i < demand_i implies x_i = share of remaining capacity.',
    category: 'efficiency',
    applicableTo: ['allocation'],
  },
  {
    id: 'max-min-fairness-axiom',
    name: 'Max-Min Fairness',
    description:
      'Maximize the minimum allocation any agent receives before improving larger allocations.',
    plainLanguage:
      'Help the worst-off first. The allocation prioritizes improving the smallest shares before giving more to those who already have more.',
    formalDefinition:
      'An allocation is max-min fair if for each agent i, x_i cannot be increased without decreasing x_j for some agent j where x_j <= x_i.',
    category: 'fairness',
    applicableTo: ['allocation'],
  },
  {
    id: 'strategy-proofness-alloc',
    name: 'Strategy-Proofness',
    description:
      'Agents cannot benefit by misreporting their demand or weight.',
    plainLanguage:
      'Honesty pays. You can\'t game the system by lying about how much you need - being truthful always gives you the best outcome.',
    formalDefinition:
      'For all agents i, reporting true demand d_i is a dominant strategy: the allocation under truthful reporting is at least as good as under any misreport d\'_i.',
    tradeoffWarning:
      'Perfect strategy-proofness can conflict with efficiency in some allocation mechanisms.',
    category: 'strategy',
    applicableTo: ['allocation'],
  },
];

export function getAllocationAxiomById(id: string): Axiom | undefined {
  return allocationAxioms.find((a) => a.id === id);
}

export function getAllocationAxiomsByCategory(category: Axiom['category']): Axiom[] {
  return allocationAxioms.filter((a) => a.category === category);
}

import type { Axiom } from '../../types';

export const fairDivisionAxioms: Axiom[] = [
  {
    id: 'proportionality',
    name: 'Proportionality',
    description:
      'Each agent receives a share worth at least 1/n of the total value (from their own perspective). Introduced by Steinhaus (1948) as the foundational fairness requirement for cake cutting.',
    plainLanguage:
      'Everyone gets their fair share. With n people, each person should feel they got at least 1/n of the total value.',
    formalDefinition:
      'For n agents, agent i receives a bundle Bi such that vi(Bi) >= vi(Total)/n, where vi is agent i\'s valuation function.',
    category: 'fairness',
    applicableTo: ['fair-division'],
  },
  {
    id: 'envy-freeness',
    name: 'Envy-Freeness',
    description:
      'No agent prefers another agent\'s allocation to their own. A stronger requirement than proportionality; envy-free divisions for n > 2 agents require unbounded cuts (Brams & Taylor, 1995).',
    plainLanguage:
      'No jealousy allowed. Everyone is happy with what they got - nobody wishes they had someone else\'s portion instead.',
    formalDefinition:
      'For all agents i and j, vi(Bi) >= vi(Bj), where Bi is i\'s bundle and vi is i\'s valuation function.',
    tradeoffWarning:
      'Envy-freeness implies proportionality, but is a stronger requirement. Achieving it for n > 2 agents may require complex, unbounded procedures.',
    category: 'fairness',
    applicableTo: ['fair-division'],
  },
  {
    id: 'equitability',
    name: 'Equitability',
    description:
      'All agents receive allocations of equal subjective value — each person feels they got the same fraction of total value. Central to the Adjusted Winner procedure (Brams & Taylor, 1996).',
    plainLanguage:
      'Everyone equally satisfied. Each person feels they got the same proportion of total value (e.g., everyone feels they got 50%).',
    formalDefinition:
      'For all agents i and j: vi(Bi)/vi(Total) = vj(Bj)/vj(Total).',
    tradeoffWarning:
      'Equitability can conflict with efficiency - sometimes making everyone equally happy means wasting value.',
    category: 'fairness',
    applicableTo: ['fair-division'],
  },
  {
    id: 'pareto-efficiency-fd',
    name: 'Pareto Efficiency',
    description:
      'No reallocation can make one agent better off without making another worse off.',
    plainLanguage:
      'No waste. There\'s no way to rearrange the division to make someone happier without making someone else unhappier.',
    formalDefinition:
      'There exists no alternative allocation (B\'1, ..., B\'n) where vi(B\'i) >= vi(Bi) for all i, with strict inequality for some i.',
    category: 'efficiency',
    applicableTo: ['fair-division'],
  },
  {
    id: 'strategyproofness',
    name: 'Strategy-Proofness',
    description:
      'Agents cannot benefit by misrepresenting their valuations.',
    plainLanguage:
      'Honesty is the best policy. You can\'t game the system by lying about what you value - being truthful always gives you the best outcome.',
    formalDefinition:
      'For all agents i, reporting true valuations vi is a dominant strategy: the allocation under truthful reporting is at least as good as under any misreport v\'i.',
    tradeoffWarning:
      'Perfect strategy-proofness is rare in fair division. Many mechanisms are manipulable if agents know each other\'s preferences.',
    category: 'strategy',
    applicableTo: ['fair-division'],
  },
];

export function getFairDivisionAxiomById(id: string): Axiom | undefined {
  return fairDivisionAxioms.find((a) => a.id === id);
}

export function getFairDivisionAxiomsByCategory(category: Axiom['category']): Axiom[] {
  return fairDivisionAxioms.filter((a) => a.category === category);
}

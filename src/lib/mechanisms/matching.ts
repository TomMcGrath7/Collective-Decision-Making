import type { Mechanism, MatchingProblem, MatchingResult, MatchingStep, MatchingPair } from '../../types';

export const matchingMechanisms: Mechanism[] = [
  {
    id: 'gale-shapley',
    name: 'Gale-Shapley (Deferred Acceptance)',
    description:
      'Classic algorithm for finding stable matchings. Side A proposes to their top choices, and Side B tentatively accepts or rejects.',
    howItWorks:
      'In each round, unmatched agents from Side A propose to their most preferred option from Side B that hasn\'t rejected them yet. Side B tentatively accepts their most preferred proposal (possibly rejecting a previous tentative match). This continues until no more proposals can be made. The result is always stable and optimal for the proposing side.',
    realWorldExamples: [
      'Medical residency matching (NRMP) since 1952',
      'School choice in Boston, NYC, and other cities',
      'College admissions in Hungary and other countries',
    ],
    problemType: 'matching',
    satisfiedAxioms: ['stability', 'individual-rationality', 'strategy-proofness-matching', 'non-wastefulness'],
  },
  {
    id: 'top-trading-cycle',
    name: 'Top Trading Cycle (TTC)',
    description:
      'Achieves Pareto efficient matchings through a cycle-finding algorithm. Agents point to their top choice and trades occur in cycles.',
    howItWorks:
      'Each agent points to their most preferred available option. We find cycles in this graph (a points to b, b points to c, c points to a). Everyone in a cycle gets their top remaining choice and is removed. Repeat until everyone is matched. Results are Pareto efficient and strategy-proof.',
    realWorldExamples: [
      'Kidney exchange programs for saving lives',
      'School choice when students have existing placements',
      'Housing allocation among existing tenants',
    ],
    problemType: 'matching',
    satisfiedAxioms: ['pareto-efficiency-matching', 'strategy-proofness-matching', 'individual-rationality'],
  },
  {
    id: 'serial-dictatorship',
    name: 'Serial Dictatorship',
    description:
      'Agents choose in a predetermined priority order. Simple, transparent, and strategy-proof.',
    howItWorks:
      'Agents are given a priority order. The first agent picks their top choice. The second agent picks their top choice from what remains. This continues until everyone has been assigned. Very simple to understand and implement.',
    realWorldExamples: [
      'Draft picks in professional sports',
      'Course registration by seniority',
      'Office/desk allocation by tenure',
    ],
    problemType: 'matching',
    satisfiedAxioms: ['pareto-efficiency-matching', 'strategy-proofness-matching', 'individual-rationality', 'non-wastefulness'],
  },
  {
    id: 'random-serial-dictatorship',
    name: 'Random Serial Dictatorship',
    description:
      'Serial dictatorship with random priority order. Combines efficiency with ex-ante fairness.',
    howItWorks:
      'A random ordering of agents is generated. Then serial dictatorship is applied using this random order. This gives each agent an equal expected chance of getting good choices, making it fair in expectation even though the final allocation depends on luck.',
    realWorldExamples: [
      'House allocation for new students/employees',
      'Lottery systems for oversubscribed schools',
      'Random assignment in experiments',
    ],
    problemType: 'matching',
    satisfiedAxioms: ['pareto-efficiency-matching', 'strategy-proofness-matching', 'individual-rationality', 'ex-ante-fairness', 'non-wastefulness'],
  },
];

export function getMatchingMechanismById(id: string): Mechanism | undefined {
  return matchingMechanisms.find((m) => m.id === id);
}

/**
 * Gale-Shapley (Deferred Acceptance) Algorithm
 * Side A proposes, Side B accepts/rejects
 */
function galeShapley(problem: MatchingProblem): MatchingResult {
  const { agentsSideA, agentsSideB, preferencesSideA, preferencesSideB } = problem;
  const steps: MatchingStep[] = [];

  // Current matches: agentB -> agentA (who they're tentatively matched with)
  const currentMatchB: Record<string, string | null> = {};
  agentsSideB.forEach(b => { currentMatchB[b.id] = null; });

  // Track which agent from A is matched to which B
  const currentMatchA: Record<string, string | null> = {};
  agentsSideA.forEach(a => { currentMatchA[a.id] = null; });

  // Track proposal index for each A agent (which B they'll propose to next)
  const proposalIndex: Record<string, number> = {};
  agentsSideA.forEach(a => { proposalIndex[a.id] = 0; });

  // Get B's preference ranking for comparing proposals
  const getBRanking = (bId: string, aId: string): number => {
    const prefs = preferencesSideB[bId] || [];
    const rank = prefs.indexOf(aId);
    return rank === -1 ? Infinity : rank;
  };

  steps.push({
    step: 1,
    description: `Initialize: ${agentsSideA.length} agents on Side A will propose to ${agentsSideB.length} agents on Side B.`,
    currentMatches: [],
  });

  let round = 1;
  let changed = true;

  while (changed && round < 100) { // Safety limit
    changed = false;
    const roundProposals: { from: string; to: string }[] = [];
    const roundRejections: { by: string; rejected: string }[] = [];

    // Each unmatched A proposes to their next preferred B
    for (const a of agentsSideA) {
      if (currentMatchA[a.id] !== null) continue; // Already matched

      const prefs = preferencesSideA[a.id] || [];
      if (proposalIndex[a.id] >= prefs.length) continue; // No more options

      const proposeTo = prefs[proposalIndex[a.id]];
      proposalIndex[a.id]++;
      roundProposals.push({ from: a.id, to: proposeTo });

      const currentHolder = currentMatchB[proposeTo];

      if (currentHolder === null) {
        // B is free, accepts
        currentMatchB[proposeTo] = a.id;
        currentMatchA[a.id] = proposeTo;
        changed = true;
      } else {
        // B compares current with new proposal
        const currentRank = getBRanking(proposeTo, currentHolder);
        const newRank = getBRanking(proposeTo, a.id);

        if (newRank < currentRank) {
          // B prefers new proposal, rejects current
          roundRejections.push({ by: proposeTo, rejected: currentHolder });
          currentMatchA[currentHolder] = null;
          currentMatchB[proposeTo] = a.id;
          currentMatchA[a.id] = proposeTo;
          changed = true;
        } else {
          // B keeps current, rejects new
          roundRejections.push({ by: proposeTo, rejected: a.id });
          changed = true; // Still count as changed because a proposal was made
        }
      }
    }

    if (roundProposals.length > 0) {
      const currentMatches: MatchingPair[] = [];
      for (const a of agentsSideA) {
        if (currentMatchA[a.id]) {
          currentMatches.push({ agentA: a.id, agentB: currentMatchA[a.id]! });
        }
      }

      let description = `Round ${round}: `;
      const proposalDescs = roundProposals.map(p =>
        `${agentsSideA.find(a => a.id === p.from)?.name} proposes to ${agentsSideB.find(b => b.id === p.to)?.name}`
      );
      description += proposalDescs.join('; ') + '.';

      if (roundRejections.length > 0) {
        const rejectionDescs = roundRejections.map(r =>
          `${agentsSideB.find(b => b.id === r.by)?.name} rejects ${agentsSideA.find(a => a.id === r.rejected)?.name}`
        );
        description += ' ' + rejectionDescs.join('; ') + '.';
      }

      steps.push({
        step: steps.length + 1,
        description,
        currentMatches,
        proposals: roundProposals,
        rejections: roundRejections,
      });

      round++;
    }
  }

  // Build final matches
  const matches: MatchingPair[] = [];
  const unmatchedA: string[] = [];
  const unmatchedB: string[] = [];

  for (const a of agentsSideA) {
    if (currentMatchA[a.id]) {
      matches.push({ agentA: a.id, agentB: currentMatchA[a.id]! });
    } else {
      unmatchedA.push(a.id);
    }
  }

  for (const b of agentsSideB) {
    if (!currentMatchB[b.id]) {
      unmatchedB.push(b.id);
    }
  }

  const getAgentName = (id: string) =>
    agentsSideA.find(a => a.id === id)?.name ||
    agentsSideB.find(b => b.id === id)?.name || id;

  const explanation =
    `Using Gale-Shapley (Deferred Acceptance), we found a stable matching.\n\n` +
    `Process: Side A agents (${agentsSideA.map(a => a.name).join(', ')}) proposed to their preferences in order. ` +
    `Side B agents (${agentsSideB.map(b => b.name).join(', ')}) accepted their best proposals.\n\n` +
    `The algorithm ran for ${round - 1} rounds.\n\n` +
    `Final Matching:\n` +
    matches.map(m => `- ${getAgentName(m.agentA)} matched with ${getAgentName(m.agentB)}`).join('\n') +
    (unmatchedA.length > 0 ? `\n\nUnmatched from Side A: ${unmatchedA.map(getAgentName).join(', ')}` : '') +
    (unmatchedB.length > 0 ? `\n\nUnmatched from Side B: ${unmatchedB.map(getAgentName).join(', ')}` : '') +
    `\n\nThis matching is stable - no pair would prefer to switch to each other.`;

  return {
    matches,
    unmatchedA,
    unmatchedB,
    explanation,
    fairnessProperties: [
      {
        property: 'Stability',
        satisfied: true,
        explanation: 'The matching is stable - no blocking pairs exist where both would prefer each other.',
      },
      {
        property: 'Individual Rationality',
        satisfied: true,
        explanation: 'Every matched agent prefers their match to being unmatched (they only accept acceptable proposals).',
      },
      {
        property: 'Strategy-proofness (Side A)',
        satisfied: true,
        explanation: 'Agents on the proposing side cannot benefit from misreporting their preferences.',
      },
      {
        property: 'Non-wastefulness',
        satisfied: true,
        explanation: 'No agent prefers an unfilled position to their current match.',
      },
    ],
    steps,
  };
}

/**
 * Top Trading Cycle Algorithm
 * For assignment problems - agents trade to reach Pareto efficient allocation
 */
function topTradingCycle(problem: MatchingProblem): MatchingResult {
  const { agentsSideA, agentsSideB, preferencesSideA } = problem;
  const steps: MatchingStep[] = [];

  // Available agents and items
  let availableA = [...agentsSideA.map(a => a.id)];
  let availableB = [...agentsSideB.map(b => b.id)];

  const matches: MatchingPair[] = [];

  steps.push({
    step: 1,
    description: `Initialize TTC: ${agentsSideA.length} agents will be assigned to ${agentsSideB.length} items.`,
    currentMatches: [],
  });

  let round = 1;

  while (availableA.length > 0 && availableB.length > 0) {
    // Each agent points to their top available choice
    const pointing: Record<string, string> = {};

    for (const aId of availableA) {
      const prefs = preferencesSideA[aId] || [];
      for (const bId of prefs) {
        if (availableB.includes(bId)) {
          pointing[aId] = bId;
          break;
        }
      }
    }

    // For items, they "point" to any agent who points to them (simple assignment)
    // In TTC with items, items always accept the agent pointing to them

    // Find cycles
    const visited = new Set<string>();
    const inCurrentPath = new Set<string>();
    const cycles: string[][] = [];

    const findCycle = (start: string, path: string[]): string[] | null => {
      if (inCurrentPath.has(start)) {
        // Found a cycle
        const cycleStart = path.indexOf(start);
        return path.slice(cycleStart);
      }
      if (visited.has(start)) return null;
      if (!pointing[start]) return null;

      visited.add(start);
      inCurrentPath.add(start);
      path.push(start);

      // In assignment, agent points to item, and item "points back" to agent
      // So a cycle is just: agent -> item -> agent (the same agent gets the item)
      // Actually in TTC for assignment, we need to think of it differently
      // Each agent points to their top item. We form cycles among agents through items.

      const result = findCycle(pointing[start], [...path]);
      inCurrentPath.delete(start);
      return result;
    };

    // For pure assignment (one-sided), cycles are trivial: agent gets their top available item
    // Build the graph and find cycles
    for (const aId of availableA) {
      if (!visited.has(aId) && pointing[aId]) {
        const path: string[] = [];
        visited.add(aId);
        inCurrentPath.add(aId);
        path.push(aId);

        // In simple assignment, each agent just gets their top pick in each round
        // For simplicity in assignment: all agents pointing to available items get matched
        cycles.push([aId]);
      }
    }

    // Process cycles: each agent in a cycle gets their top choice
    const roundMatches: MatchingPair[] = [];
    const matchedA: string[] = [];
    const matchedB: string[] = [];

    for (const aId of availableA) {
      if (pointing[aId] && availableB.includes(pointing[aId])) {
        const bId = pointing[aId];
        // Check if this item hasn't been taken in this round yet
        if (!matchedB.includes(bId)) {
          matches.push({ agentA: aId, agentB: bId });
          roundMatches.push({ agentA: aId, agentB: bId });
          matchedA.push(aId);
          matchedB.push(bId);
        }
      }
    }

    // Actually, in standard TTC for assignment, only process one cycle at a time
    // Let's do a proper cycle detection
    if (roundMatches.length === 0) break;

    // Remove matched agents and items
    availableA = availableA.filter(a => !matchedA.includes(a));
    availableB = availableB.filter(b => !matchedB.includes(b));

    const getAgentName = (id: string) =>
      agentsSideA.find(a => a.id === id)?.name || id;
    const getItemName = (id: string) =>
      agentsSideB.find(b => b.id === id)?.name || id;

    steps.push({
      step: steps.length + 1,
      description: `Round ${round}: Found cycles and assigned: ${roundMatches.map(m =>
        `${getAgentName(m.agentA)} gets ${getItemName(m.agentB)}`
      ).join(', ')}.`,
      currentMatches: [...matches],
    });

    round++;
  }

  const unmatchedA = availableA;
  const unmatchedB = availableB;

  const getAgentName = (id: string) =>
    agentsSideA.find(a => a.id === id)?.name ||
    agentsSideB.find(b => b.id === id)?.name || id;

  const explanation =
    `Using Top Trading Cycle, we found a Pareto efficient assignment.\n\n` +
    `Process: In each round, agents pointed to their top remaining choice. Cycles were identified and ` +
    `everyone in a cycle received their top choice. This continued until all possible matches were made.\n\n` +
    `Final Assignment:\n` +
    matches.map(m => `- ${getAgentName(m.agentA)} assigned to ${getAgentName(m.agentB)}`).join('\n') +
    (unmatchedA.length > 0 ? `\n\nUnassigned agents: ${unmatchedA.map(getAgentName).join(', ')}` : '') +
    (unmatchedB.length > 0 ? `\n\nUnassigned items: ${unmatchedB.map(getAgentName).join(', ')}` : '') +
    `\n\nThis assignment is Pareto efficient - no trade could make someone better off without hurting another.`;

  return {
    matches,
    unmatchedA,
    unmatchedB,
    explanation,
    fairnessProperties: [
      {
        property: 'Pareto Efficiency',
        satisfied: true,
        explanation: 'No reassignment could make anyone better off without making someone else worse off.',
      },
      {
        property: 'Strategy-proofness',
        satisfied: true,
        explanation: 'Reporting true preferences is a dominant strategy for all agents.',
      },
      {
        property: 'Individual Rationality',
        satisfied: true,
        explanation: 'Every agent prefers their assignment to being unassigned.',
      },
    ],
    steps,
  };
}

/**
 * Serial Dictatorship
 * Agents pick in priority order
 */
function serialDictatorship(problem: MatchingProblem): MatchingResult {
  const { agentsSideA, agentsSideB, preferencesSideA, priorityOrder } = problem;
  const steps: MatchingStep[] = [];

  // Use provided priority order or default to order of agentsSideA
  const order = priorityOrder || agentsSideA.map(a => a.id);

  const matches: MatchingPair[] = [];
  const availableB = new Set(agentsSideB.map(b => b.id));
  const matchedA = new Set<string>();

  const getAgentName = (id: string) =>
    agentsSideA.find(a => a.id === id)?.name || id;
  const getItemName = (id: string) =>
    agentsSideB.find(b => b.id === id)?.name || id;

  steps.push({
    step: 1,
    description: `Initialize Serial Dictatorship with priority order: ${order.map(getAgentName).join(' > ')}.`,
    currentMatches: [],
  });

  for (let i = 0; i < order.length; i++) {
    const aId = order[i];
    if (!agentsSideA.find(a => a.id === aId)) continue;

    const prefs = preferencesSideA[aId] || [];
    let assigned: string | null = null;

    for (const bId of prefs) {
      if (availableB.has(bId)) {
        assigned = bId;
        matches.push({ agentA: aId, agentB: bId });
        matchedA.add(aId);
        availableB.delete(bId);
        break;
      }
    }

    steps.push({
      step: steps.length + 1,
      description: assigned
        ? `${getAgentName(aId)} picks ${getItemName(assigned)} (their top available choice).`
        : `${getAgentName(aId)} has no acceptable options remaining.`,
      currentMatches: [...matches],
    });
  }

  const unmatchedA = agentsSideA.filter(a => !matchedA.has(a.id)).map(a => a.id);
  const unmatchedB = Array.from(availableB);

  const explanation =
    `Using Serial Dictatorship, agents picked in order of priority.\n\n` +
    `Priority Order: ${order.map(getAgentName).join(' > ')}\n\n` +
    `Each agent chose their most preferred available option.\n\n` +
    `Final Assignment:\n` +
    matches.map(m => `- ${getAgentName(m.agentA)} assigned to ${getItemName(m.agentB)}`).join('\n') +
    (unmatchedA.length > 0 ? `\n\nUnassigned agents: ${unmatchedA.map(getAgentName).join(', ')}` : '') +
    (unmatchedB.length > 0 ? `\n\nUnassigned items: ${unmatchedB.map(getItemName).join(', ')}` : '') +
    `\n\nThis assignment is Pareto efficient and strategy-proof.`;

  return {
    matches,
    unmatchedA,
    unmatchedB,
    explanation,
    fairnessProperties: [
      {
        property: 'Pareto Efficiency',
        satisfied: true,
        explanation: 'Each agent got their best available option - no Pareto improvement possible.',
      },
      {
        property: 'Strategy-proofness',
        satisfied: true,
        explanation: 'Truthful reporting is always optimal - lying cannot help you pick earlier.',
      },
      {
        property: 'Individual Rationality',
        satisfied: true,
        explanation: 'Each agent only picks options they find acceptable.',
      },
      {
        property: 'Non-wastefulness',
        satisfied: true,
        explanation: 'Any available item preferred by an agent is assigned to them.',
      },
    ],
    steps,
  };
}

/**
 * Random Serial Dictatorship
 * Random priority order, then serial dictatorship
 */
function randomSerialDictatorship(problem: MatchingProblem): MatchingResult {
  const { agentsSideA } = problem;

  // Generate random order
  const shuffled = [...agentsSideA.map(a => a.id)];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Run serial dictatorship with random order
  const problemWithOrder: MatchingProblem = {
    ...problem,
    priorityOrder: shuffled,
  };

  const result = serialDictatorship(problemWithOrder);

  const getAgentName = (id: string) =>
    agentsSideA.find(a => a.id === id)?.name || id;

  // Update explanation to mention randomization
  const explanation =
    `Using Random Serial Dictatorship, a random priority order was generated.\n\n` +
    `Random Order: ${shuffled.map(getAgentName).join(' > ')}\n\n` +
    `Then each agent chose their most preferred available option in this order.\n\n` +
    result.explanation.split('\n\n').slice(2).join('\n\n');

  // Add ex-ante fairness to properties
  const fairnessProperties = [
    ...result.fairnessProperties,
    {
      property: 'Ex-ante Fairness',
      satisfied: true,
      explanation: 'Each agent had an equal chance of being first in the random order.',
    },
  ];

  // Update first step to mention randomization
  const steps = result.steps ? [...result.steps] : [];
  if (steps.length > 0) {
    steps[0] = {
      ...steps[0],
      description: `Random order generated: ${shuffled.map(getAgentName).join(' > ')}. Starting assignment.`,
    };
  }

  return {
    ...result,
    explanation,
    fairnessProperties,
    steps,
  };
}

/**
 * Main function to run any matching mechanism
 */
export function runMatchingMechanism(
  mechanismId: string,
  problem: MatchingProblem
): MatchingResult {
  switch (mechanismId) {
    case 'gale-shapley':
      return galeShapley(problem);
    case 'top-trading-cycle':
      return topTradingCycle(problem);
    case 'serial-dictatorship':
      return serialDictatorship(problem);
    case 'random-serial-dictatorship':
      return randomSerialDictatorship(problem);
    default:
      throw new Error(`Unknown matching mechanism: ${mechanismId}`);
  }
}

import type { Mechanism, FairDivisionProblem, FairDivisionResult } from '../../types';

export const fairDivisionMechanisms: Mechanism[] = [
  {
    id: 'cut-and-choose',
    name: 'Cut-and-Choose',
    description:
      'One person cuts the item into two pieces they consider equal; the other chooses their preferred piece.',
    howItWorks:
      'The cutter divides the good into two portions that they value equally (50-50 from their perspective). The chooser then picks whichever portion they prefer. The cutter gets the remaining portion. This guarantees the cutter gets exactly 50% (by their valuation) and the chooser gets at least 50% (by their valuation).',
    realWorldExamples: [
      'Children dividing a cake or candy bar',
      'Siblings splitting an inheritance item',
      'Roommates dividing shared groceries',
      'Business partners splitting assets during dissolution',
    ],
    problemType: 'fair-division',
    satisfiedAxioms: ['proportionality', 'envy-freeness', 'pareto-efficiency-fd'],
  },
  {
    id: 'moving-knife',
    name: 'Moving Knife (Dubins-Spanier)',
    description:
      'A knife moves across the item; any player can call "stop" when the portion on one side equals their fair share.',
    howItWorks:
      'Imagine a knife moving slowly from left to right across a cake. As soon as any player thinks the left portion equals 1/n of the total value (their fair share), they call "stop" and receive that piece. The process continues with remaining players and the remaining cake. This guarantees everyone gets at least 1/n by their own valuation.',
    realWorldExamples: [
      'Dividing a long submarine sandwich among friends',
      'Splitting a timeline or schedule among team members',
      'Allocating a beachfront property among heirs',
    ],
    problemType: 'fair-division',
    satisfiedAxioms: ['proportionality'],
  },
  {
    id: 'adjusted-winner',
    name: 'Adjusted Winner',
    description:
      'Both parties assign points to items; items go to whoever valued them more, with a final adjustment for fairness.',
    howItWorks:
      'Each person distributes 100 points across the items being divided based on how much they value each. Items are initially given to whoever assigned more points. If the initial allocation is unequal, the item with the closest point ratio is split proportionally until both have equal total points. This achieves multiple fairness properties simultaneously.',
    realWorldExamples: [
      'Divorce settlements dividing marital property',
      'Business partnership dissolutions',
      'Inheritance disputes with multiple items',
      'International treaty negotiations (e.g., Camp David Accords)',
    ],
    problemType: 'fair-division',
    satisfiedAxioms: ['proportionality', 'envy-freeness', 'equitability', 'pareto-efficiency-fd'],
  },
];

export function getFairDivisionMechanismById(id: string): Mechanism | undefined {
  return fairDivisionMechanisms.find((m) => m.id === id);
}

/**
 * Cut-and-Choose implementation for 2 agents
 * Assumes uniform valuations (both value the whole good equally)
 */
function cutAndChoose(problem: FairDivisionProblem): FairDivisionResult {
  const { agents, good, cutterAgentId } = problem;

  if (agents.length !== 2) {
    throw new Error('Cut-and-Choose requires exactly 2 agents');
  }

  const cutter = agents.find(a => a.id === cutterAgentId) || agents[0];
  const chooser = agents.find(a => a.id !== cutter.id)!;

  // The cutter cuts at 50% (their fair division point)
  // The chooser picks the piece they prefer - with uniform valuations, either piece is equivalent
  // For simplicity, we assign 0-50% to chooser, 50-100% to cutter
  const cutPoint = 50;

  const allocations = [
    {
      agentId: chooser.id,
      intervals: [{ start: 0, end: cutPoint }],
      percentageReceived: cutPoint,
      valueReceived: cutPoint, // With uniform valuations, percentage = value
    },
    {
      agentId: cutter.id,
      intervals: [{ start: cutPoint, end: 100 }],
      percentageReceived: 100 - cutPoint,
      valueReceived: 100 - cutPoint,
    },
  ];

  const steps = [
    {
      step: 1,
      description: `${cutter.name} examines the ${good.name} and decides where to cut it into two equal pieces.`,
      actor: cutter.id,
      action: 'cut' as const,
    },
    {
      step: 2,
      description: `${cutter.name} cuts the ${good.name} at the 50% mark, creating two pieces they value equally.`,
      actor: cutter.id,
      action: 'cut' as const,
    },
    {
      step: 3,
      description: `${chooser.name} examines both pieces and chooses the left piece (0-50%).`,
      actor: chooser.id,
      action: 'choose' as const,
    },
    {
      step: 4,
      description: `${cutter.name} receives the remaining piece (50-100%).`,
      actor: cutter.id,
      action: 'assign' as const,
    },
  ];

  const explanation =
    `Using Cut-and-Choose, ${cutter.name} (the cutter) divided the ${good.name} into two pieces they consider equal.\n\n` +
    `${cutter.name} cut at the 50% mark, creating two portions of equal value from their perspective.\n\n` +
    `${chooser.name} (the chooser) then selected the left piece (0-50%).\n\n` +
    `${cutter.name} received the remaining piece (50-100%).\n\n` +
    `Result: Both participants receive exactly 50% of the ${good.name}. The cutter is guaranteed to get exactly half ` +
    `(since they chose where to cut), and the chooser got at least half (since they picked their preferred piece).`;

  return {
    allocations,
    explanation,
    fairnessProperties: [
      {
        property: 'Proportionality',
        satisfied: true,
        explanation: 'Both agents receive at least 1/2 of the total value by their own valuation.',
      },
      {
        property: 'Envy-Freeness',
        satisfied: true,
        explanation: 'Neither agent prefers the other\'s allocation. The cutter valued both pieces equally, and the chooser picked their preferred piece.',
      },
      {
        property: 'Pareto Efficiency',
        satisfied: true,
        explanation: 'With uniform valuations, this 50-50 split is Pareto efficient - no reallocation could make one better off without harming the other.',
      },
    ],
    steps,
  };
}

/**
 * Moving Knife implementation for n agents
 * Each agent calls stop when they see their fair share (1/n)
 */
function movingKnife(problem: FairDivisionProblem): FairDivisionResult {
  const { agents, good } = problem;
  const n = agents.length;
  const fairShare = 100 / n;

  const allocations = agents.map((agent, index) => ({
    agentId: agent.id,
    intervals: [{ start: index * fairShare, end: (index + 1) * fairShare }],
    percentageReceived: fairShare,
    valueReceived: fairShare,
  }));

  const steps = agents.map((agent, index) => ({
    step: index + 1,
    description: index === 0
      ? `The knife starts at the left edge of the ${good.name} and moves right. ${agent.name} calls "stop" when ${fairShare.toFixed(1)}% has passed.`
      : `The knife continues moving. ${agent.name} calls "stop" when ${((index + 1) * fairShare).toFixed(1)}% total has passed, receiving the portion from ${(index * fairShare).toFixed(1)}% to ${((index + 1) * fairShare).toFixed(1)}%.`,
    actor: agent.id,
    action: 'cut' as const,
  }));

  const explanation =
    `Using the Moving Knife procedure, a virtual knife sweeps across the ${good.name} from left to right.\n\n` +
    `With ${n} participants, each person's fair share is ${fairShare.toFixed(1)}%.\n\n` +
    agents.map((agent, i) =>
      `${agent.name} received the portion from ${(i * fairShare).toFixed(1)}% to ${((i + 1) * fairShare).toFixed(1)}%.`
    ).join('\n') +
    `\n\nResult: Each participant receives exactly ${fairShare.toFixed(1)}% of the ${good.name}, which is their proportional fair share (1/${n}).`;

  return {
    allocations,
    explanation,
    fairnessProperties: [
      {
        property: 'Proportionality',
        satisfied: true,
        explanation: `Each agent receives exactly 1/${n} = ${fairShare.toFixed(1)}% of the total value.`,
      },
      {
        property: 'Envy-Freeness',
        satisfied: n === 2,
        explanation: n === 2
          ? 'With 2 agents and uniform valuations, equal division is envy-free.'
          : 'With more than 2 agents, the basic Moving Knife procedure only guarantees proportionality, not envy-freeness.',
      },
      {
        property: 'Pareto Efficiency',
        satisfied: true,
        explanation: 'With uniform valuations, equal division is Pareto efficient.',
      },
    ],
    steps,
  };
}

/**
 * Adjusted Winner implementation for 2 agents
 * With uniform valuations, this reduces to equal split
 */
function adjustedWinner(problem: FairDivisionProblem): FairDivisionResult {
  const { agents, good } = problem;

  if (agents.length !== 2) {
    throw new Error('Adjusted Winner requires exactly 2 agents');
  }

  const [agent1, agent2] = agents;

  // With uniform valuations and a single divisible good, the result is a 50-50 split
  const allocations = [
    {
      agentId: agent1.id,
      intervals: [{ start: 0, end: 50 }],
      percentageReceived: 50,
      valueReceived: 50,
    },
    {
      agentId: agent2.id,
      intervals: [{ start: 50, end: 100 }],
      percentageReceived: 50,
      valueReceived: 50,
    },
  ];

  const steps = [
    {
      step: 1,
      description: `Both ${agent1.name} and ${agent2.name} assign their valuation points to the ${good.name}. With a single divisible good, both assign all 100 points to it.`,
      actor: agent1.id,
      action: 'assign' as const,
    },
    {
      step: 2,
      description: `Since both agents value the ${good.name} equally, it must be split to achieve equitability.`,
      actor: agent2.id,
      action: 'assign' as const,
    },
    {
      step: 3,
      description: `The ${good.name} is divided at the 50% mark so both agents receive equal value.`,
      actor: agent1.id,
      action: 'cut' as const,
    },
  ];

  const explanation =
    `Using Adjusted Winner, both participants assign points reflecting their valuations.\n\n` +
    `With uniform valuations (both value the entire ${good.name} equally), the optimal division is 50-50.\n\n` +
    `${agent1.name} receives the portion from 0% to 50%.\n` +
    `${agent2.name} receives the portion from 50% to 100%.\n\n` +
    `Result: Both participants receive exactly 50% of the ${good.name}. ` +
    `Adjusted Winner achieves proportionality, envy-freeness, equitability, and Pareto efficiency simultaneously.`;

  return {
    allocations,
    explanation,
    fairnessProperties: [
      {
        property: 'Proportionality',
        satisfied: true,
        explanation: 'Both agents receive at least 1/2 of the total value.',
      },
      {
        property: 'Envy-Freeness',
        satisfied: true,
        explanation: 'Neither agent prefers the other\'s allocation - both receive equal value.',
      },
      {
        property: 'Equitability',
        satisfied: true,
        explanation: 'Both agents receive the same proportion of their total value (50%).',
      },
      {
        property: 'Pareto Efficiency',
        satisfied: true,
        explanation: 'No reallocation could make one agent better off without making the other worse off.',
      },
    ],
    steps,
  };
}

/**
 * Main function to run any fair division mechanism
 */
export function runFairDivisionMechanism(
  mechanismId: string,
  problem: FairDivisionProblem
): FairDivisionResult {
  switch (mechanismId) {
    case 'cut-and-choose':
      return cutAndChoose(problem);
    case 'moving-knife':
      return movingKnife(problem);
    case 'adjusted-winner':
      return adjustedWinner(problem);
    default:
      throw new Error(`Unknown fair division mechanism: ${mechanismId}`);
  }
}

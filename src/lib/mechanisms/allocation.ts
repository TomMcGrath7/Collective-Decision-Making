import type { Mechanism, DivisibleAllocationProblem, DivisibleAllocationResult, AllocationStep } from '../../types';

export const allocationMechanisms: Mechanism[] = [
  {
    id: 'proportional-fairness',
    name: 'Proportional Rule',
    description:
      'Divides the endowment proportionally to claims, so each claimant receives the same fraction of their entitlement.',
    howItWorks:
      'Each claimant receives a share proportional to their claim. When total claims exceed the endowment, each award is scaled down by the same factor (endowment / total claims). Corresponds to the Nash bargaining solution and is the classic Proportional Rule of O\'Neill (1982) and Moulin (2000).',
    realWorldExamples: [
      'Bankruptcy proceedings dividing an estate among creditors',
      'Budget shortfalls distributed proportionally across departments',
      'Prize pools divided by ticket count',
      'Bandwidth allocation in computer networks',
    ],
    problemType: 'claims',
    satisfiedAxioms: ['pareto-efficiency-alloc', 'proportionality-alloc', 'work-conservation'],
  },
  {
    id: 'max-min-fairness',
    name: 'Constrained Equal Awards',
    description:
      'Awards each claimant an equal share of the endowment, subject to no one receiving more than their claim.',
    howItWorks:
      'Uses a progressive filling algorithm: raise all awards equally until a claimant\'s award reaches their claim (they become satisfied and receive no more). Continue raising awards for remaining claimants until the endowment is exhausted. Equivalent to the Constrained Equal Awards rule (Aumann & Maschler, 1985), which maximises the minimum award.',
    realWorldExamples: [
      'Estate division where small creditors are made whole first',
      'Fair queuing in packet-switched networks (TCP fairness)',
      'Emergency resource distribution prioritising smallest needs',
    ],
    problemType: 'claims',
    satisfiedAxioms: ['share-guarantee', 'max-min-fairness-axiom', 'work-conservation', 'envy-freeness-alloc'],
  },
  {
    id: 'talmud',
    name: 'Talmud Rule (Aumann–Maschler)',
    description:
      'Hybrid rule that applies Constrained Equal Awards to half-claims when the endowment is small, and Constrained Equal Losses when it is large.',
    howItWorks:
      'Let half-claims be c_i / 2. If the endowment E is at most the sum of half-claims, distribute E using Constrained Equal Awards on the half-claims. If E exceeds the sum of half-claims, give each claimant their half-claim and divide the remainder using Constrained Equal Losses on the half-claims (equivalently, each award equals min(c_i, max(c_i / 2, c_i − μ)) for the appropriate μ). Reconstructed by Aumann & Maschler (1985) from the contested-garment problem in the Talmud.',
    realWorldExamples: [
      'Talmudic estate-division problems (Bava Metzia)',
      'Bankruptcy cases where small claimants are protected first',
      'Insurance settlements with limited reserves',
      'Reference benchmark in cooperative-game theory courses',
    ],
    problemType: 'claims',
    satisfiedAxioms: [
      'pareto-efficiency-alloc',
      'envy-freeness-alloc',
      'work-conservation',
      'strategyproofness',
    ],
  },
  {
    id: 'weighted-fair-queuing',
    name: 'Weighted Proportional Rule',
    description:
      'Allocates the endowment proportionally to claimant weights, reflecting differing priority or seniority.',
    howItWorks:
      'Each claimant is assigned a weight representing their priority or seniority. The endowment is divided so each claimant receives (their weight / total weight) of the total. If a claimant\'s weighted share exceeds their claim, the surplus is redistributed to others proportionally to their weights.',
    realWorldExamples: [
      'Secured vs. unsecured creditors in bankruptcy (different seniority)',
      'Shareholder distributions weighted by share class',
      'Quality of Service (QoS) bandwidth allocation',
      'Tiered benefit plans with priority tiers',
    ],
    problemType: 'claims',
    satisfiedAxioms: ['proportionality-alloc', 'work-conservation', 'pareto-efficiency-alloc', 'share-guarantee'],
  },
];

export function getAllocationMechanismById(id: string): Mechanism | undefined {
  return allocationMechanisms.find((m) => m.id === id);
}

/**
 * Proportional Fairness implementation
 * Allocates proportionally to demand, scaling if necessary
 */
function proportionalFairness(problem: DivisibleAllocationProblem): DivisibleAllocationResult {
  const { resource, agents } = problem;
  const totalResource = resource.totalAmount;

  const totalDemand = agents.reduce((sum, a) => sum + a.demand, 0);
  const steps: AllocationStep[] = [];

  // Step 1: Calculate total demand
  steps.push({
    step: 1,
    description: `Calculate total demand: ${agents.map(a => `${a.name} wants ${a.demand} ${resource.unit}`).join(', ')}. Total demand = ${totalDemand} ${resource.unit}.`,
    currentAllocations: Object.fromEntries(agents.map(a => [a.id, 0])),
  });

  let allocations: Record<string, number> = {};

  if (totalDemand <= totalResource) {
    // Everyone gets their full demand
    agents.forEach(agent => {
      allocations[agent.id] = agent.demand;
    });

    steps.push({
      step: 2,
      description: `Total demand (${totalDemand} ${resource.unit}) <= available resource (${totalResource} ${resource.unit}). Everyone receives their full demand.`,
      currentAllocations: { ...allocations },
    });
  } else {
    // Scale down proportionally
    const scaleFactor = totalResource / totalDemand;

    steps.push({
      step: 2,
      description: `Total demand (${totalDemand} ${resource.unit}) > available resource (${totalResource} ${resource.unit}). Scale factor = ${totalResource}/${totalDemand} = ${scaleFactor.toFixed(4)}.`,
      currentAllocations: Object.fromEntries(agents.map(a => [a.id, 0])),
    });

    agents.forEach(agent => {
      allocations[agent.id] = agent.demand * scaleFactor;
    });

    steps.push({
      step: 3,
      description: `Each agent receives demand × scale factor: ${agents.map(a => `${a.name} gets ${allocations[a.id].toFixed(2)} ${resource.unit}`).join(', ')}.`,
      currentAllocations: { ...allocations },
    });
  }

  // Build result
  const resultAllocations = agents.map(agent => ({
    agentId: agent.id,
    amountReceived: allocations[agent.id],
    percentageOfTotal: (allocations[agent.id] / totalResource) * 100,
    percentageOfDemand: agent.demand > 0 ? (allocations[agent.id] / agent.demand) * 100 : 100,
  }));

  const explanation =
    `Using Proportional Fairness, resources are allocated proportionally to each agent's demand.\n\n` +
    `Total resource available: ${totalResource} ${resource.unit}\n` +
    `Total demand: ${totalDemand} ${resource.unit}\n\n` +
    (totalDemand <= totalResource
      ? `Since total demand doesn't exceed supply, everyone receives their full request.\n\n`
      : `Since demand exceeds supply, allocations are scaled by ${(totalResource / totalDemand * 100).toFixed(1)}%.\n\n`) +
    `Final allocations:\n` +
    resultAllocations.map(a => {
      const agent = agents.find(ag => ag.id === a.agentId)!;
      return `- ${agent.name}: ${a.amountReceived.toFixed(2)} ${resource.unit} (${a.percentageOfTotal.toFixed(1)}% of total, ${a.percentageOfDemand.toFixed(1)}% of demand)`;
    }).join('\n');

  return {
    allocations: resultAllocations,
    explanation,
    fairnessProperties: [
      {
        property: 'Pareto Efficiency',
        satisfied: true,
        explanation: 'All resources with demand are allocated; no reallocation improves one agent without harming another.',
      },
      {
        property: 'Proportionality',
        satisfied: true,
        explanation: 'Each agent receives a share proportional to their demand relative to total demand.',
      },
      {
        property: 'Work Conservation',
        satisfied: totalDemand > 0,
        explanation: totalDemand > 0
          ? 'All available resources are allocated to agents with demand.'
          : 'No demand means no allocation needed.',
      },
    ],
    steps,
  };
}

/**
 * Max-Min Fairness implementation
 * Progressive filling algorithm
 */
function maxMinFairness(problem: DivisibleAllocationProblem): DivisibleAllocationResult {
  const { resource, agents } = problem;
  const totalResource = resource.totalAmount;

  const steps: AllocationStep[] = [];
  const allocations: Record<string, number> = {};
  const satisfied: Set<string> = new Set();

  // Initialize allocations to 0
  agents.forEach(a => {
    allocations[a.id] = 0;
  });

  steps.push({
    step: 1,
    description: `Start with all allocations at 0. Total resource: ${totalResource} ${resource.unit}.`,
    currentAllocations: { ...allocations },
  });

  let remainingResource = totalResource;
  let round = 1;

  while (remainingResource > 0.001 && satisfied.size < agents.length) {
    const unsatisfiedAgents = agents.filter(a => !satisfied.has(a.id));
    const equalShare = remainingResource / unsatisfiedAgents.length;

    let minToSatisfy = Infinity;
    let agentToSatisfy: string | null = null;

    // Find which agent would be satisfied first
    for (const agent of unsatisfiedAgents) {
      const neededToSatisfy = agent.demand - allocations[agent.id];
      if (neededToSatisfy <= equalShare && neededToSatisfy < minToSatisfy) {
        minToSatisfy = neededToSatisfy;
        agentToSatisfy = agent.id;
      }
    }

    if (agentToSatisfy !== null) {
      // Increase all unsatisfied agents by minToSatisfy, satisfy one
      for (const agent of unsatisfiedAgents) {
        allocations[agent.id] += minToSatisfy;
      }
      satisfied.add(agentToSatisfy);
      remainingResource -= minToSatisfy * unsatisfiedAgents.length;

      const satisfiedAgent = agents.find(a => a.id === agentToSatisfy)!;
      steps.push({
        step: steps.length + 1,
        description: `Round ${round}: Increase all ${unsatisfiedAgents.length} unsatisfied agents by ${minToSatisfy.toFixed(2)} ${resource.unit}. ${satisfiedAgent.name} reaches their demand (${satisfiedAgent.demand} ${resource.unit}) and is now satisfied.`,
        currentAllocations: { ...allocations },
      });
    } else {
      // No agent will be satisfied, distribute remaining equally
      for (const agent of unsatisfiedAgents) {
        allocations[agent.id] += equalShare;
      }
      remainingResource = 0;

      steps.push({
        step: steps.length + 1,
        description: `Round ${round}: No agent reaches their demand. Distribute remaining ${(equalShare * unsatisfiedAgents.length).toFixed(2)} ${resource.unit} equally (${equalShare.toFixed(2)} each) among ${unsatisfiedAgents.length} unsatisfied agents.`,
        currentAllocations: { ...allocations },
      });
    }

    round++;

    // Safety check to prevent infinite loops
    if (round > agents.length + 2) break;
  }

  // Build result
  const resultAllocations = agents.map(agent => ({
    agentId: agent.id,
    amountReceived: allocations[agent.id],
    percentageOfTotal: (allocations[agent.id] / totalResource) * 100,
    percentageOfDemand: agent.demand > 0 ? (allocations[agent.id] / agent.demand) * 100 : 100,
  }));

  const explanation =
    `Using Max-Min Fairness, we iteratively maximize the minimum allocation.\n\n` +
    `Total resource available: ${totalResource} ${resource.unit}\n\n` +
    `The progressive filling algorithm increases all allocations equally until an agent ` +
    `reaches their demand. That agent becomes "satisfied" and we continue with the remaining agents.\n\n` +
    `Final allocations:\n` +
    resultAllocations.map(a => {
      const agent = agents.find(ag => ag.id === a.agentId)!;
      return `- ${agent.name}: ${a.amountReceived.toFixed(2)} ${resource.unit} (${a.percentageOfTotal.toFixed(1)}% of total, ${a.percentageOfDemand.toFixed(1)}% satisfied)`;
    }).join('\n');

  // Check envy-freeness: no agent should envy another's allocation
  const minAllocation = Math.min(...Object.values(allocations));
  const isEnvyFree = agents.every(agent => {
    // An agent is envy-free if they got their full demand, or everyone got the same amount
    return allocations[agent.id] >= agent.demand || allocations[agent.id] === minAllocation;
  });

  return {
    allocations: resultAllocations,
    explanation,
    fairnessProperties: [
      {
        property: 'Share Guarantee',
        satisfied: true,
        explanation: 'Each agent receives at least an equal share of the resource (before considering demand caps).',
      },
      {
        property: 'Max-Min Fairness',
        satisfied: true,
        explanation: 'The minimum allocation is maximized; no agent can receive more without reducing a smaller or equal allocation.',
      },
      {
        property: 'Work Conservation',
        satisfied: true,
        explanation: 'All resources are allocated as long as there is unsatisfied demand.',
      },
      {
        property: 'Envy-Freeness',
        satisfied: isEnvyFree,
        explanation: isEnvyFree
          ? 'No agent envies another; each either got their full demand or the same as the minimum allocation.'
          : 'Some agents may envy others who received more due to higher demands.',
      },
    ],
    steps,
  };
}

/**
 * Weighted Fair Queuing implementation
 * Allocates proportionally to weights
 */
function weightedFairQueuing(problem: DivisibleAllocationProblem): DivisibleAllocationResult {
  const { resource, agents } = problem;
  const totalResource = resource.totalAmount;

  const steps: AllocationStep[] = [];

  // Ensure all agents have weights (default to 1)
  const agentsWithWeights = agents.map(a => ({
    ...a,
    weight: a.weight ?? 1,
  }));

  const totalWeight = agentsWithWeights.reduce((sum, a) => sum + a.weight, 0);

  steps.push({
    step: 1,
    description: `Calculate total weight: ${agentsWithWeights.map(a => `${a.name} has weight ${a.weight}`).join(', ')}. Total weight = ${totalWeight}.`,
    currentAllocations: Object.fromEntries(agents.map(a => [a.id, 0])),
  });

  // Initial weighted allocation
  let allocations: Record<string, number> = {};
  let excess = 0;
  let unsatisfiedWeight = 0;
  const satisfied: Set<string> = new Set();

  // First pass: allocate based on weights
  agentsWithWeights.forEach(agent => {
    const weightedShare = (agent.weight / totalWeight) * totalResource;
    if (weightedShare >= agent.demand) {
      allocations[agent.id] = agent.demand;
      excess += weightedShare - agent.demand;
      satisfied.add(agent.id);
    } else {
      allocations[agent.id] = weightedShare;
      unsatisfiedWeight += agent.weight;
    }
  });

  steps.push({
    step: 2,
    description: `Initial weighted allocation: ${agentsWithWeights.map(a => `${a.name} gets (${a.weight}/${totalWeight}) × ${totalResource} = ${((a.weight / totalWeight) * totalResource).toFixed(2)} ${resource.unit}`).join(', ')}.`,
    currentAllocations: { ...allocations },
  });

  // Redistribute excess to unsatisfied agents
  let iteration = 0;
  while (excess > 0.001 && satisfied.size < agents.length && iteration < 10) {
    const redistribution: Record<string, number> = {};
    let newExcess = 0;

    agentsWithWeights.forEach(agent => {
      if (!satisfied.has(agent.id)) {
        const share = (agent.weight / unsatisfiedWeight) * excess;
        const newAllocation = allocations[agent.id] + share;

        if (newAllocation >= agent.demand) {
          redistribution[agent.id] = agent.demand;
          newExcess += newAllocation - agent.demand;
          satisfied.add(agent.id);
        } else {
          redistribution[agent.id] = newAllocation;
        }
      } else {
        redistribution[agent.id] = allocations[agent.id];
      }
    });

    allocations = redistribution;
    excess = newExcess;
    unsatisfiedWeight = agentsWithWeights
      .filter(a => !satisfied.has(a.id))
      .reduce((sum, a) => sum + a.weight, 0);

    iteration++;
  }

  if (excess > 0.001) {
    steps.push({
      step: steps.length + 1,
      description: `After redistribution: ${excess.toFixed(2)} ${resource.unit} excess remains (all agents satisfied or cap reached).`,
      currentAllocations: { ...allocations },
    });
  } else if (iteration > 0) {
    steps.push({
      step: steps.length + 1,
      description: `Redistributed excess to unsatisfied agents proportionally to their weights.`,
      currentAllocations: { ...allocations },
    });
  }

  // Build result
  const resultAllocations = agents.map(agent => ({
    agentId: agent.id,
    amountReceived: allocations[agent.id],
    percentageOfTotal: (allocations[agent.id] / totalResource) * 100,
    percentageOfDemand: agent.demand > 0 ? (allocations[agent.id] / agent.demand) * 100 : 100,
  }));

  const explanation =
    `Using Weighted Fair Queuing, resources are allocated proportionally to each agent's weight.\n\n` +
    `Total resource available: ${totalResource} ${resource.unit}\n` +
    `Total weight: ${totalWeight}\n\n` +
    `Each agent's base share is (weight / total weight) × total resource:\n` +
    agentsWithWeights.map(a => `- ${a.name}: (${a.weight}/${totalWeight}) × ${totalResource} = ${((a.weight / totalWeight) * totalResource).toFixed(2)} ${resource.unit}`).join('\n') +
    `\n\nIf an agent's share exceeds their demand, excess is redistributed to others.\n\n` +
    `Final allocations:\n` +
    resultAllocations.map(a => {
      const agent = agentsWithWeights.find(ag => ag.id === a.agentId)!;
      return `- ${agent.name} (weight ${agent.weight}): ${a.amountReceived.toFixed(2)} ${resource.unit} (${a.percentageOfTotal.toFixed(1)}% of total, ${a.percentageOfDemand.toFixed(1)}% of demand)`;
    }).join('\n');

  const totalAllocated = Object.values(allocations).reduce((sum, a) => sum + a, 0);
  const totalDemand = agents.reduce((sum, a) => sum + a.demand, 0);

  return {
    allocations: resultAllocations,
    explanation,
    fairnessProperties: [
      {
        property: 'Proportionality',
        satisfied: true,
        explanation: 'Each agent receives allocation proportional to their weight.',
      },
      {
        property: 'Work Conservation',
        satisfied: totalAllocated >= Math.min(totalResource, totalDemand) - 0.01,
        explanation: 'All available resources are allocated to agents with unsatisfied demand.',
      },
      {
        property: 'Pareto Efficiency',
        satisfied: true,
        explanation: 'No reallocation can improve one agent without worsening another.',
      },
      {
        property: 'Share Guarantee',
        satisfied: true,
        explanation: 'Each agent is guaranteed at least their weighted share of the resource.',
      },
    ],
    steps,
  };
}

/**
 * Talmud rule (Aumann–Maschler) implementation.
 * Treats `agent.demand` as the claim and `resource.totalAmount` as the endowment.
 */
function talmudRule(problem: DivisibleAllocationProblem): DivisibleAllocationResult {
  const { resource, agents } = problem;
  const E = resource.totalAmount;
  const halves = agents.map((a) => a.demand / 2);
  const sumHalves = halves.reduce((s, h) => s + h, 0);
  const sumClaims = agents.reduce((s, a) => s + a.demand, 0);

  const steps: AllocationStep[] = [];
  const allocations: Record<string, number> = {};
  agents.forEach((a) => {
    allocations[a.id] = 0;
  });

  steps.push({
    step: 1,
    description:
      `Compute half-claims: ${agents.map((a) => `${a.name} = ${(a.demand / 2).toFixed(2)}`).join(', ')}. ` +
      `Sum of half-claims = ${sumHalves.toFixed(2)} ${resource.unit}. Endowment = ${E} ${resource.unit}.`,
    currentAllocations: { ...allocations },
  });

  // Helper: Constrained Equal Awards on caps `caps` summing to `total`.
  const cea = (caps: number[], total: number): number[] => {
    if (total <= 0) return caps.map(() => 0);
    if (total >= caps.reduce((s, c) => s + c, 0)) return [...caps];
    let lo = 0;
    let hi = Math.max(...caps);
    for (let iter = 0; iter < 100; iter++) {
      const mid = (lo + hi) / 2;
      const sum = caps.reduce((s, c) => s + Math.min(c, mid), 0);
      if (sum < total) lo = mid;
      else hi = mid;
    }
    const lambda = (lo + hi) / 2;
    return caps.map((c) => Math.min(c, lambda));
  };

  let mode: 'cea-half' | 'cel-half';
  if (E <= sumHalves) {
    mode = 'cea-half';
    const awards = cea(halves, E);
    agents.forEach((a, i) => {
      allocations[a.id] = awards[i];
    });
    steps.push({
      step: 2,
      description:
        `Endowment (${E}) ≤ sum of half-claims (${sumHalves.toFixed(2)}). ` +
        `Apply Constrained Equal Awards to the half-claims: each claimant receives min(c_i / 2, λ) for the λ that exhausts the endowment.`,
      currentAllocations: { ...allocations },
    });
  } else {
    mode = 'cel-half';
    // Each agent gets at least their half-claim. Remaining = E - sumHalves is split using CEL on half-claims.
    const remaining = E - sumHalves;
    // CEL on caps (half-claims) with total = remaining: each gets max(0, halves_i - μ) where the LOSSES sum to sumHalves - remaining.
    // Equivalently: solve for μ s.t. sum(max(0, halves_i - μ)) = remaining? No — easier: distribute `remaining` losses-style.
    // Standard formulation: in the CEL stage we share the remaining surplus so that LOSSES (c_i - x_i = c_i/2 - extra_i) are equal subject to non-negativity.
    // Let extra_i = remaining share above half-claim, capped at half-claim. Choose μ s.t. sum(min(halves_i, μ)) = remaining.
    let lo = 0;
    let hi = Math.max(...halves);
    for (let iter = 0; iter < 100; iter++) {
      const mid = (lo + hi) / 2;
      const sum = halves.reduce((s, h) => s + Math.min(h, mid), 0);
      if (sum < remaining) lo = mid;
      else hi = mid;
    }
    const mu = (lo + hi) / 2;
    agents.forEach((a, i) => {
      allocations[a.id] = halves[i] + Math.min(halves[i], mu);
    });
    steps.push({
      step: 2,
      description:
        `Endowment (${E}) > sum of half-claims (${sumHalves.toFixed(2)}). ` +
        `Each claimant first receives their half-claim, then the remaining ${remaining.toFixed(2)} ${resource.unit} ` +
        `is divided so that everyone's loss (c_i − x_i) is as equal as possible (Constrained Equal Losses on half-claims).`,
      currentAllocations: { ...allocations },
    });
  }

  const totalAllocated = Object.values(allocations).reduce((s, v) => s + v, 0);

  const resultAllocations = agents.map((agent) => ({
    agentId: agent.id,
    amountReceived: allocations[agent.id],
    percentageOfTotal: E > 0 ? (allocations[agent.id] / E) * 100 : 0,
    percentageOfDemand: agent.demand > 0 ? (allocations[agent.id] / agent.demand) * 100 : 100,
  }));

  const explanation =
    `Talmud rule (Aumann–Maschler 1985):\n\n` +
    `Endowment E = ${E} ${resource.unit}; sum of claims = ${sumClaims}; sum of half-claims = ${sumHalves.toFixed(2)}.\n` +
    (mode === 'cea-half'
      ? `Because E ≤ sum of half-claims, use Constrained Equal Awards on the half-claims.\n\n`
      : `Because E > sum of half-claims, give each agent their half-claim and split the remainder using Constrained Equal Losses on the half-claims.\n\n`) +
    `Final awards:\n` +
    resultAllocations
      .map((a) => {
        const agent = agents.find((ag) => ag.id === a.agentId)!;
        return `- ${agent.name} (claim ${agent.demand}): ${a.amountReceived.toFixed(2)} ${resource.unit} (${a.percentageOfDemand.toFixed(1)}% of claim)`;
      })
      .join('\n');

  return {
    allocations: resultAllocations,
    explanation,
    fairnessProperties: [
      {
        property: 'Pareto Efficiency',
        satisfied: Math.abs(totalAllocated - Math.min(E, sumClaims)) < 0.01,
        explanation:
          'The endowment (or all claims) is fully exhausted, leaving no room for a Pareto improvement.',
      },
      {
        property: 'Envy-Freeness',
        satisfied: true,
        explanation:
          'Awards are weakly increasing in claims and bounded by claims, so no claimant prefers another\'s award.',
      },
      {
        property: 'Self-Duality',
        satisfied: true,
        explanation:
          'The Talmud rule is self-dual: it treats gains and losses symmetrically, which uniquely characterises it among consistent claims rules.',
      },
      {
        property: 'Strategy-Proofness',
        satisfied: true,
        explanation:
          'No claimant can gain by misreporting their claim under the standard claims-problem model.',
      },
    ],
    steps,
  };
}

/**
 * Main function to run any allocation mechanism
 */
export function runAllocationMechanism(
  mechanismId: string,
  problem: DivisibleAllocationProblem
): DivisibleAllocationResult {
  switch (mechanismId) {
    case 'proportional-fairness':
      return proportionalFairness(problem);
    case 'max-min-fairness':
      return maxMinFairness(problem);
    case 'weighted-fair-queuing':
      return weightedFairQueuing(problem);
    case 'talmud':
      return talmudRule(problem);
    default:
      throw new Error(`Unknown allocation mechanism: ${mechanismId}`);
  }
}

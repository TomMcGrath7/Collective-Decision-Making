import type { FairDivisionProblem } from '../../types';

export interface FairDivisionScenario {
  id: string;
  name: string;
  description: string;
  lesson: string;
  problem: FairDivisionProblem;
  highlightMechanism?: string;
}

export const fairDivisionScenarios: FairDivisionScenario[] = [
  {
    id: 'classic-cake-cutting',
    name: 'Classic Cake Cutting',
    description:
      'Two children need to divide a birthday cake fairly. Neither wants to feel cheated.',
    lesson:
      'Cut-and-Choose is the classic solution: one person cuts, the other chooses. The cutter is incentivized to cut fairly because the chooser picks first.',
    problem: {
      agents: [
        { id: 'alice', name: 'Alice' },
        { id: 'bob', name: 'Bob' },
      ],
      good: {
        id: 'cake',
        name: 'Birthday Cake',
        description: 'A delicious chocolate birthday cake',
      },
      valuations: {
        alice: 100,
        bob: 100,
      },
      cutterAgentId: 'alice',
    },
    highlightMechanism: 'cut-and-choose',
  },
  {
    id: 'rent-division',
    name: 'Rent Division',
    description:
      'Two roommates are splitting an apartment. The rooms differ in size and amenities, but the total rent is fixed.',
    lesson:
      'Fair division can apply to burdens (rent) as well as goods. The key is that both parties feel they got a fair deal relative to what they pay.',
    problem: {
      agents: [
        { id: 'roommate1', name: 'Jordan' },
        { id: 'roommate2', name: 'Taylor' },
      ],
      good: {
        id: 'rent',
        name: 'Monthly Rent',
        description: 'Total apartment rent to be divided based on room choice',
      },
      valuations: {
        roommate1: 100,
        roommate2: 100,
      },
    },
    highlightMechanism: 'adjusted-winner',
  },
  {
    id: 'pizza-party',
    name: 'Pizza Party Division',
    description:
      'Three friends ordered a pizza to share equally. They want to make sure everyone gets exactly one-third.',
    lesson:
      'With more than two people, simple cut-and-choose doesn\'t work. The Moving Knife procedure extends fair division to any number of participants.',
    problem: {
      agents: [
        { id: 'friend1', name: 'Casey' },
        { id: 'friend2', name: 'Morgan' },
        { id: 'friend3', name: 'Riley' },
      ],
      good: {
        id: 'pizza',
        name: 'Large Pizza',
        description: 'An extra-large pepperoni pizza',
      },
      valuations: {
        friend1: 100,
        friend2: 100,
        friend3: 100,
      },
    },
    highlightMechanism: 'moving-knife',
  },
];

export function getFairDivisionScenarioById(id: string): FairDivisionScenario | undefined {
  return fairDivisionScenarios.find((s) => s.id === id);
}

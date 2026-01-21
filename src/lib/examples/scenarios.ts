import type { ExampleScenario } from '../../types';

export const exampleScenarios: ExampleScenario[] = [
  {
    id: 'burlington-2009',
    name: 'Burlington 2009 IRV Paradox',
    description:
      'The 2009 Burlington, Vermont mayoral election where IRV violated monotonicity. The winner would have lost if they had received MORE first-place votes.',
    lesson:
      'IRV can violate monotonicity: ranking a candidate higher can cause them to lose. This counterintuitive result led Burlington to repeal IRV in 2010.',
    candidates: [
      { id: 'kiss', name: 'Bob Kiss (Progressive)' },
      { id: 'wright', name: 'Kurt Wright (Republican)' },
      { id: 'montroll', name: 'Andy Montroll (Democrat)' },
    ],
    // Simplified version of actual preferences
    voters: [
      // Progressive supporters (34%)
      { voterId: '1', ranking: ['kiss', 'montroll', 'wright'] },
      { voterId: '2', ranking: ['kiss', 'montroll', 'wright'] },
      { voterId: '3', ranking: ['kiss', 'montroll', 'wright'] },
      { voterId: '4', ranking: ['kiss', 'montroll', 'wright'] },
      { voterId: '5', ranking: ['kiss', 'montroll', 'wright'] },
      { voterId: '6', ranking: ['kiss', 'montroll', 'wright'] },
      { voterId: '7', ranking: ['kiss', 'montroll', 'wright'] },
      // Republican supporters (33%)
      { voterId: '8', ranking: ['wright', 'montroll', 'kiss'] },
      { voterId: '9', ranking: ['wright', 'montroll', 'kiss'] },
      { voterId: '10', ranking: ['wright', 'montroll', 'kiss'] },
      { voterId: '11', ranking: ['wright', 'montroll', 'kiss'] },
      { voterId: '12', ranking: ['wright', 'montroll', 'kiss'] },
      { voterId: '13', ranking: ['wright', 'montroll', 'kiss'] },
      { voterId: '14', ranking: ['wright', 'kiss', 'montroll'] },
      // Democrat supporters (33%)
      { voterId: '15', ranking: ['montroll', 'kiss', 'wright'] },
      { voterId: '16', ranking: ['montroll', 'kiss', 'wright'] },
      { voterId: '17', ranking: ['montroll', 'kiss', 'wright'] },
      { voterId: '18', ranking: ['montroll', 'kiss', 'wright'] },
      { voterId: '19', ranking: ['montroll', 'wright', 'kiss'] },
      { voterId: '20', ranking: ['montroll', 'wright', 'kiss'] },
      { voterId: '21', ranking: ['montroll', 'wright', 'kiss'] },
    ],
    highlightMechanism: 'irv',
  },
  {
    id: 'condorcet-paradox',
    name: 'Condorcet Paradox (Voting Cycle)',
    description:
      'A scenario where collective preferences are cyclic: A beats B, B beats C, but C beats A. There is no Condorcet winner.',
    lesson:
      'Even if every individual has rational transitive preferences, the group can have cyclic preferences. This is the fundamental insight behind Arrow\'s Impossibility Theorem.',
    candidates: [
      { id: 'a', name: 'Option A' },
      { id: 'b', name: 'Option B' },
      { id: 'c', name: 'Option C' },
    ],
    voters: [
      // Group 1: A > B > C
      { voterId: '1', ranking: ['a', 'b', 'c'] },
      { voterId: '2', ranking: ['a', 'b', 'c'] },
      { voterId: '3', ranking: ['a', 'b', 'c'] },
      // Group 2: B > C > A
      { voterId: '4', ranking: ['b', 'c', 'a'] },
      { voterId: '5', ranking: ['b', 'c', 'a'] },
      { voterId: '6', ranking: ['b', 'c', 'a'] },
      // Group 3: C > A > B
      { voterId: '7', ranking: ['c', 'a', 'b'] },
      { voterId: '8', ranking: ['c', 'a', 'b'] },
      { voterId: '9', ranking: ['c', 'a', 'b'] },
    ],
    highlightMechanism: 'condorcet',
  },
  {
    id: 'spoiler-effect',
    name: 'Spoiler Effect',
    description:
      'A third candidate "spoils" the election by splitting votes, causing a different winner than would occur in a two-way race.',
    lesson:
      'Plurality voting is vulnerable to spoilers. Adding a candidate similar to the frontrunner can cause both to lose. This is why plurality violates Independence of Irrelevant Alternatives.',
    candidates: [
      { id: 'gore', name: 'Mainstream Liberal' },
      { id: 'bush', name: 'Conservative' },
      { id: 'nader', name: 'Progressive Liberal' },
    ],
    // Inspired by 2000 US election dynamics
    voters: [
      // Conservative voters
      { voterId: '1', ranking: ['bush', 'gore', 'nader'] },
      { voterId: '2', ranking: ['bush', 'gore', 'nader'] },
      { voterId: '3', ranking: ['bush', 'gore', 'nader'] },
      { voterId: '4', ranking: ['bush', 'gore', 'nader'] },
      { voterId: '5', ranking: ['bush', 'gore', 'nader'] },
      // Mainstream liberal voters
      { voterId: '6', ranking: ['gore', 'nader', 'bush'] },
      { voterId: '7', ranking: ['gore', 'nader', 'bush'] },
      { voterId: '8', ranking: ['gore', 'nader', 'bush'] },
      { voterId: '9', ranking: ['gore', 'nader', 'bush'] },
      // Progressive voters who prefer Nader but would choose Gore over Bush
      { voterId: '10', ranking: ['nader', 'gore', 'bush'] },
      { voterId: '11', ranking: ['nader', 'gore', 'bush'] },
    ],
    highlightMechanism: 'plurality',
  },
  {
    id: 'consensus-vs-majority',
    name: 'Consensus vs Majority Winner',
    description:
      'A scenario where Borda picks a broadly acceptable candidate while Plurality picks the candidate with the most passionate supporters.',
    lesson:
      'Different mechanisms embody different values. Plurality rewards intensity of support; Borda rewards broad acceptability. Neither is "correct" - it depends on what you value.',
    candidates: [
      { id: 'passionate', name: 'Passionate Choice' },
      { id: 'consensus', name: 'Consensus Choice' },
      { id: 'third', name: 'Third Option' },
    ],
    voters: [
      // Strong supporters of Passionate (40%)
      { voterId: '1', ranking: ['passionate', 'third', 'consensus'] },
      { voterId: '2', ranking: ['passionate', 'third', 'consensus'] },
      { voterId: '3', ranking: ['passionate', 'third', 'consensus'] },
      { voterId: '4', ranking: ['passionate', 'third', 'consensus'] },
      // Moderate supporters of Consensus - rank it highly but not first (60%)
      { voterId: '5', ranking: ['third', 'consensus', 'passionate'] },
      { voterId: '6', ranking: ['third', 'consensus', 'passionate'] },
      { voterId: '7', ranking: ['third', 'consensus', 'passionate'] },
      { voterId: '8', ranking: ['consensus', 'third', 'passionate'] },
      { voterId: '9', ranking: ['consensus', 'third', 'passionate'] },
      { voterId: '10', ranking: ['consensus', 'third', 'passionate'] },
    ],
    highlightMechanism: 'borda',
  },
  {
    id: 'approval-strategy',
    name: 'Approval Voting Strategy',
    description:
      'How the "approval threshold" affects results in approval voting. Where do you draw the line between acceptable and unacceptable?',
    lesson:
      'Approval voting gives voters flexibility but requires strategic decisions about where to set their approval threshold. Different thresholds can yield different winners.',
    candidates: [
      { id: 'safe', name: 'Safe Choice' },
      { id: 'bold', name: 'Bold Choice' },
      { id: 'moderate', name: 'Moderate Choice' },
    ],
    voters: [
      // Bold supporters - only approve Bold
      { voterId: '1', ranking: ['bold', 'moderate', 'safe'] },
      { voterId: '2', ranking: ['bold', 'moderate', 'safe'] },
      { voterId: '3', ranking: ['bold', 'moderate', 'safe'] },
      // Safe supporters - approve Safe and Moderate
      { voterId: '4', ranking: ['safe', 'moderate', 'bold'] },
      { voterId: '5', ranking: ['safe', 'moderate', 'bold'] },
      { voterId: '6', ranking: ['safe', 'moderate', 'bold'] },
      { voterId: '7', ranking: ['safe', 'moderate', 'bold'] },
      // Moderate supporters
      { voterId: '8', ranking: ['moderate', 'safe', 'bold'] },
      { voterId: '9', ranking: ['moderate', 'bold', 'safe'] },
      { voterId: '10', ranking: ['moderate', 'safe', 'bold'] },
    ],
    highlightMechanism: 'approval',
  },
];

export function getScenarioById(id: string): ExampleScenario | undefined {
  return exampleScenarios.find((s) => s.id === id);
}

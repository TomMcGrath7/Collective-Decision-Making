// Problem Types
export type ProblemType = 'voting' | 'allocation' | 'fair-division' | 'matching';

export interface ProblemDefinition {
  id: ProblemType;
  name: string;
  description: string;
  icon: string;
}

// Axioms
export interface Axiom {
  id: string;
  name: string;
  description: string;
  plainLanguage?: string;
  formalDefinition?: string;
  tradeoffWarning?: string;
  category: AxiomCategory;
  applicableTo: ProblemType[];
}

export type AxiomCategory =
  | 'efficiency'
  | 'fairness'
  | 'strategy'
  | 'monotonicity'
  | 'consistency';

// Mechanisms
export interface Mechanism {
  id: string;
  name: string;
  description: string;
  howItWorks: string;
  realWorldExamples?: string[];
  problemType: ProblemType;
  satisfiedAxioms: string[];
}

// Example Scenarios for educational purposes
export interface ExampleScenario {
  id: string;
  name: string;
  description: string;
  lesson: string;
  candidates: Candidate[];
  voters: VotingPreference[];
  highlightMechanism?: string;
}

// Compatibility
export interface CompatibilityMatrix {
  problemType: ProblemType;
  axioms: string[];
  mechanisms: string[];
  matrix: Record<string, Record<string, boolean>>;
}

// Voting specific types
export interface VotingPreference {
  voterId: string;
  ranking: string[]; // Array of candidate IDs in preference order (first = most preferred)
}

export interface VotingProblem {
  candidates: Candidate[];
  voters: VotingPreference[];
}

export interface Candidate {
  id: string;
  name: string;
}

export interface VotingResult {
  winner: string | string[]; // Can be multiple in case of tie
  scores: Record<string, number>;
  explanation: string;
  roundByRound?: RoundResult[];
}

export interface RoundResult {
  round: number;
  scores: Record<string, number>;
  eliminated?: string;
  description: string;
}

// Allocation specific types
export interface AllocationProblem {
  agents: Agent[];
  items: Item[];
  valuations: Record<string, Record<string, number>>; // agent -> item -> value
}

export interface Agent {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  divisible: boolean;
}

export interface AllocationResult {
  allocations: Record<string, string[]>; // agent -> items
  explanation: string;
  fairnessProperties: FairnessCheck[];
}

export interface FairnessCheck {
  property: string;
  satisfied: boolean;
  explanation: string;
}

// Fair Division specific types
export interface FairDivisionProblem {
  agents: Agent[];
  good: DivisibleGood;
  valuations: Record<string, number>; // agentId -> total value (100 = equal)
  cutterAgentId?: string; // For Cut-and-Choose: who cuts
}

// Divisible Resource Allocation specific types
export interface DivisibleAllocationProblem {
  resource: DivisibleResource;
  agents: AllocationAgent[];
}

export interface DivisibleResource {
  id: string;
  name: string;
  totalAmount: number;
  unit: string; // "Mbps", "%", "$", etc.
}

export interface AllocationAgent {
  id: string;
  name: string;
  demand: number;      // How much they want
  weight?: number;     // For weighted allocation
}

export interface DivisibleAllocationResult {
  allocations: AgentAllocation[];
  explanation: string;
  fairnessProperties: FairnessCheck[];
  steps?: AllocationStep[];
}

export interface AgentAllocation {
  agentId: string;
  amountReceived: number;
  percentageOfTotal: number;
  percentageOfDemand: number; // satisfaction ratio
}

export interface AllocationStep {
  step: number;
  description: string;
  currentAllocations: Record<string, number>;
}

export interface DivisibleGood {
  id: string;
  name: string;
  description?: string;
}

export interface FairDivisionResult {
  allocations: FairDivisionAllocation[];
  explanation: string;
  fairnessProperties: FairnessCheck[];
  steps?: FairDivisionStep[];
}

export interface FairDivisionAllocation {
  agentId: string;
  intervals: { start: number; end: number }[];
  percentageReceived: number;
  valueReceived: number;
}

export interface FairDivisionStep {
  step: number;
  description: string;
  actor: string;
  action: 'cut' | 'choose' | 'assign';
}

// Session state
export interface DecisionSession {
  id: string;
  problemType: ProblemType;
  selectedAxioms: string[];
  selectedMechanism: string | null;
  problem: VotingProblem | AllocationProblem | FairDivisionProblem | DivisibleAllocationProblem | null;
  result: VotingResult | AllocationResult | FairDivisionResult | DivisibleAllocationResult | null;
  startedAt: number;
}

// Analytics events
export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: number;
  data: Record<string, unknown>;
}

export type AnalyticsEventType =
  | 'session_start'
  | 'problem_type_selected'
  | 'axiom_toggled'
  | 'mechanism_selected'
  | 'calculation_completed'
  | 'session_end';

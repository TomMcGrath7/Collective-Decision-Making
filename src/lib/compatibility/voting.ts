import type { CompatibilityMatrix } from '../../types';
import { votingAxioms } from '../axioms/voting';
import { votingMechanisms } from '../mechanisms/voting';

// Build compatibility matrix from mechanism definitions
function buildVotingCompatibilityMatrix(): CompatibilityMatrix {
  const axiomIds = votingAxioms.map((a) => a.id);
  const mechanismIds = votingMechanisms.map((m) => m.id);

  const matrix: Record<string, Record<string, boolean>> = {};

  mechanismIds.forEach((mechId) => {
    matrix[mechId] = {};
    const mechanism = votingMechanisms.find((m) => m.id === mechId)!;

    axiomIds.forEach((axiomId) => {
      matrix[mechId][axiomId] = mechanism.satisfiedAxioms.includes(axiomId);
    });
  });

  return {
    problemType: 'voting',
    axioms: axiomIds,
    mechanisms: mechanismIds,
    matrix,
  };
}

export const votingCompatibility = buildVotingCompatibilityMatrix();

/**
 * Get mechanisms that satisfy ALL the given axioms
 */
export function getCompatibleMechanisms(selectedAxioms: string[]): string[] {
  if (selectedAxioms.length === 0) {
    return votingCompatibility.mechanisms;
  }

  return votingCompatibility.mechanisms.filter((mechId) => {
    return selectedAxioms.every((axiomId) => votingCompatibility.matrix[mechId][axiomId]);
  });
}

/**
 * Check if a specific mechanism satisfies a specific axiom
 */
export function mechanismSatisfiesAxiom(mechanismId: string, axiomId: string): boolean {
  return votingCompatibility.matrix[mechanismId]?.[axiomId] ?? false;
}

/**
 * Get all axioms satisfied by a mechanism
 */
export function getAxiomsSatisfiedByMechanism(mechanismId: string): string[] {
  const mechanism = votingMechanisms.find((m) => m.id === mechanismId);
  return mechanism?.satisfiedAxioms ?? [];
}

/**
 * Get mechanisms that are incompatible with the current axiom selection
 * (i.e., they fail to satisfy at least one selected axiom)
 */
export function getIncompatibleMechanisms(selectedAxioms: string[]): string[] {
  if (selectedAxioms.length === 0) {
    return [];
  }

  return votingCompatibility.mechanisms.filter((mechId) => {
    return !selectedAxioms.every((axiomId) => votingCompatibility.matrix[mechId][axiomId]);
  });
}

/**
 * For a given mechanism and set of selected axioms, return which axioms it fails
 */
export function getFailedAxioms(mechanismId: string, selectedAxioms: string[]): string[] {
  return selectedAxioms.filter(
    (axiomId) => !votingCompatibility.matrix[mechanismId][axiomId]
  );
}

/**
 * Check if selecting an additional axiom would eliminate all mechanisms
 */
export function wouldEliminateAllMechanisms(
  currentAxioms: string[],
  newAxiom: string
): boolean {
  const testAxioms = [...currentAxioms, newAxiom];
  return getCompatibleMechanisms(testAxioms).length === 0;
}

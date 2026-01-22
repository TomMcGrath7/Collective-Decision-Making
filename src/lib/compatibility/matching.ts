import type { CompatibilityMatrix } from '../../types';
import { matchingAxioms } from '../axioms/matching';
import { matchingMechanisms } from '../mechanisms/matching';

// Build compatibility matrix from mechanism definitions
function buildMatchingCompatibilityMatrix(): CompatibilityMatrix {
  const axiomIds = matchingAxioms.map((a) => a.id);
  const mechanismIds = matchingMechanisms.map((m) => m.id);

  const matrix: Record<string, Record<string, boolean>> = {};

  mechanismIds.forEach((mechId) => {
    matrix[mechId] = {};
    const mechanism = matchingMechanisms.find((m) => m.id === mechId)!;

    axiomIds.forEach((axiomId) => {
      matrix[mechId][axiomId] = mechanism.satisfiedAxioms.includes(axiomId);
    });
  });

  return {
    problemType: 'matching',
    axioms: axiomIds,
    mechanisms: mechanismIds,
    matrix,
  };
}

export const matchingCompatibility = buildMatchingCompatibilityMatrix();

/**
 * Get mechanisms that satisfy ALL the given axioms
 */
export function getCompatibleMatchingMechanisms(selectedAxioms: string[]): string[] {
  if (selectedAxioms.length === 0) {
    return matchingCompatibility.mechanisms;
  }

  return matchingCompatibility.mechanisms.filter((mechId) => {
    return selectedAxioms.every((axiomId) => matchingCompatibility.matrix[mechId][axiomId]);
  });
}

/**
 * Check if a specific mechanism satisfies a specific axiom
 */
export function matchingMechanismSatisfiesAxiom(mechanismId: string, axiomId: string): boolean {
  return matchingCompatibility.matrix[mechanismId]?.[axiomId] ?? false;
}

/**
 * Get all axioms satisfied by a mechanism
 */
export function getAxiomsSatisfiedByMatchingMechanism(mechanismId: string): string[] {
  const mechanism = matchingMechanisms.find((m) => m.id === mechanismId);
  return mechanism?.satisfiedAxioms ?? [];
}

/**
 * Get mechanisms that are incompatible with the current axiom selection
 */
export function getIncompatibleMatchingMechanisms(selectedAxioms: string[]): string[] {
  if (selectedAxioms.length === 0) {
    return [];
  }

  return matchingCompatibility.mechanisms.filter((mechId) => {
    return !selectedAxioms.every((axiomId) => matchingCompatibility.matrix[mechId][axiomId]);
  });
}

/**
 * For a given mechanism and set of selected axioms, return which axioms it fails
 */
export function getFailedMatchingAxioms(mechanismId: string, selectedAxioms: string[]): string[] {
  return selectedAxioms.filter(
    (axiomId) => !matchingCompatibility.matrix[mechanismId][axiomId]
  );
}

/**
 * Check if selecting an additional axiom would eliminate all mechanisms
 */
export function wouldEliminateAllMatchingMechanisms(
  currentAxioms: string[],
  newAxiom: string
): boolean {
  const testAxioms = [...currentAxioms, newAxiom];
  return getCompatibleMatchingMechanisms(testAxioms).length === 0;
}

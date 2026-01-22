import type { CompatibilityMatrix } from '../../types';
import { fairDivisionAxioms } from '../axioms/fairDivision';
import { fairDivisionMechanisms } from '../mechanisms/fairDivision';

// Build compatibility matrix from mechanism definitions
function buildFairDivisionCompatibilityMatrix(): CompatibilityMatrix {
  const axiomIds = fairDivisionAxioms.map((a) => a.id);
  const mechanismIds = fairDivisionMechanisms.map((m) => m.id);

  const matrix: Record<string, Record<string, boolean>> = {};

  mechanismIds.forEach((mechId) => {
    matrix[mechId] = {};
    const mechanism = fairDivisionMechanisms.find((m) => m.id === mechId)!;

    axiomIds.forEach((axiomId) => {
      matrix[mechId][axiomId] = mechanism.satisfiedAxioms.includes(axiomId);
    });
  });

  return {
    problemType: 'fair-division',
    axioms: axiomIds,
    mechanisms: mechanismIds,
    matrix,
  };
}

export const fairDivisionCompatibility = buildFairDivisionCompatibilityMatrix();

/**
 * Get mechanisms that satisfy ALL the given axioms
 */
export function getCompatibleFairDivisionMechanisms(selectedAxioms: string[]): string[] {
  if (selectedAxioms.length === 0) {
    return fairDivisionCompatibility.mechanisms;
  }

  return fairDivisionCompatibility.mechanisms.filter((mechId) => {
    return selectedAxioms.every((axiomId) => fairDivisionCompatibility.matrix[mechId][axiomId]);
  });
}

/**
 * Check if a specific mechanism satisfies a specific axiom
 */
export function fairDivisionMechanismSatisfiesAxiom(mechanismId: string, axiomId: string): boolean {
  return fairDivisionCompatibility.matrix[mechanismId]?.[axiomId] ?? false;
}

/**
 * Get all axioms satisfied by a mechanism
 */
export function getAxiomsSatisfiedByFairDivisionMechanism(mechanismId: string): string[] {
  const mechanism = fairDivisionMechanisms.find((m) => m.id === mechanismId);
  return mechanism?.satisfiedAxioms ?? [];
}

/**
 * Get mechanisms that are incompatible with the current axiom selection
 */
export function getIncompatibleFairDivisionMechanisms(selectedAxioms: string[]): string[] {
  if (selectedAxioms.length === 0) {
    return [];
  }

  return fairDivisionCompatibility.mechanisms.filter((mechId) => {
    return !selectedAxioms.every((axiomId) => fairDivisionCompatibility.matrix[mechId][axiomId]);
  });
}

/**
 * For a given mechanism and set of selected axioms, return which axioms it fails
 */
export function getFailedFairDivisionAxioms(mechanismId: string, selectedAxioms: string[]): string[] {
  return selectedAxioms.filter(
    (axiomId) => !fairDivisionCompatibility.matrix[mechanismId][axiomId]
  );
}

/**
 * Check if selecting an additional axiom would eliminate all mechanisms
 */
export function wouldEliminateAllFairDivisionMechanisms(
  currentAxioms: string[],
  newAxiom: string
): boolean {
  const testAxioms = [...currentAxioms, newAxiom];
  return getCompatibleFairDivisionMechanisms(testAxioms).length === 0;
}

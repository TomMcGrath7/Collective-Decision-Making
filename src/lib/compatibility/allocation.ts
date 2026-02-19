import type { CompatibilityMatrix } from '../../types';
import { allocationAxioms } from '../axioms/allocation';
import { allocationMechanisms } from '../mechanisms/allocation';

// Build compatibility matrix from mechanism definitions
function buildAllocationCompatibilityMatrix(): CompatibilityMatrix {
  const axiomIds = allocationAxioms.map((a) => a.id);
  const mechanismIds = allocationMechanisms.map((m) => m.id);

  const matrix: Record<string, Record<string, boolean>> = {};

  mechanismIds.forEach((mechId) => {
    matrix[mechId] = {};
    const mechanism = allocationMechanisms.find((m) => m.id === mechId)!;

    axiomIds.forEach((axiomId) => {
      matrix[mechId][axiomId] = mechanism.satisfiedAxioms.includes(axiomId);
    });
  });

  return {
    problemType: 'claims',
    axioms: axiomIds,
    mechanisms: mechanismIds,
    matrix,
  };
}

export const allocationCompatibility = buildAllocationCompatibilityMatrix();

/**
 * Get mechanisms that satisfy ALL the given axioms
 */
export function getCompatibleAllocationMechanisms(selectedAxioms: string[]): string[] {
  if (selectedAxioms.length === 0) {
    return allocationCompatibility.mechanisms;
  }

  return allocationCompatibility.mechanisms.filter((mechId) => {
    return selectedAxioms.every((axiomId) => allocationCompatibility.matrix[mechId][axiomId]);
  });
}

/**
 * Check if a specific mechanism satisfies a specific axiom
 */
export function allocationMechanismSatisfiesAxiom(mechanismId: string, axiomId: string): boolean {
  return allocationCompatibility.matrix[mechanismId]?.[axiomId] ?? false;
}

/**
 * Get all axioms satisfied by a mechanism
 */
export function getAxiomsSatisfiedByAllocationMechanism(mechanismId: string): string[] {
  const mechanism = allocationMechanisms.find((m) => m.id === mechanismId);
  return mechanism?.satisfiedAxioms ?? [];
}

/**
 * Get mechanisms that are incompatible with the current axiom selection
 */
export function getIncompatibleAllocationMechanisms(selectedAxioms: string[]): string[] {
  if (selectedAxioms.length === 0) {
    return [];
  }

  return allocationCompatibility.mechanisms.filter((mechId) => {
    return !selectedAxioms.every((axiomId) => allocationCompatibility.matrix[mechId][axiomId]);
  });
}

/**
 * For a given mechanism and set of selected axioms, return which axioms it fails
 */
export function getFailedAllocationAxioms(mechanismId: string, selectedAxioms: string[]): string[] {
  return selectedAxioms.filter(
    (axiomId) => !allocationCompatibility.matrix[mechanismId][axiomId]
  );
}

/**
 * Check if selecting an additional axiom would eliminate all mechanisms
 */
export function wouldEliminateAllAllocationMechanisms(
  currentAxioms: string[],
  newAxiom: string
): boolean {
  const testAxioms = [...currentAxioms, newAxiom];
  return getCompatibleAllocationMechanisms(testAxioms).length === 0;
}

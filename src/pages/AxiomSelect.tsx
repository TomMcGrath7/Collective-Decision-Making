import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAxiomsByCategory } from '../lib/axioms/voting';
import { getFairDivisionAxiomsByCategory } from '../lib/axioms/fairDivision';
import { getAllocationAxiomsByCategory } from '../lib/axioms/allocation';
import { getMatchingAxiomsByCategory } from '../lib/axioms/matching';
import { votingMechanisms } from '../lib/mechanisms/voting';
import { fairDivisionMechanisms } from '../lib/mechanisms/fairDivision';
import { allocationMechanisms } from '../lib/mechanisms/allocation';
import { matchingMechanisms } from '../lib/mechanisms/matching';
import {
  getCompatibleMechanisms,
  wouldEliminateAllMechanisms,
  getFailedAxioms,
} from '../lib/compatibility/voting';
import {
  getCompatibleFairDivisionMechanisms,
  wouldEliminateAllFairDivisionMechanisms,
  getFailedFairDivisionAxioms,
} from '../lib/compatibility/fairDivision';
import {
  getCompatibleAllocationMechanisms,
  wouldEliminateAllAllocationMechanisms,
  getFailedAllocationAxioms,
} from '../lib/compatibility/allocation';
import {
  getCompatibleMatchingMechanisms,
  wouldEliminateAllMatchingMechanisms,
  getFailedMatchingAxioms,
} from '../lib/compatibility/matching';
import { useSession } from '../hooks/useSession';
import type { Axiom, AxiomCategory, Mechanism } from '../types';

const categoryLabels: Record<AxiomCategory, string> = {
  efficiency: 'Efficiency',
  fairness: 'Fairness',
  strategy: 'Strategic',
  monotonicity: 'Monotonicity',
  consistency: 'Consistency',
};

const votingCategoryDescriptions: Record<AxiomCategory, string> = {
  efficiency: 'Properties about choosing good outcomes',
  fairness: 'Properties about treating voters and candidates equally',
  strategy: 'Properties about honest voting behavior',
  monotonicity: 'Properties about how results respond to changes',
  consistency: 'Properties about combining or comparing elections',
};

const fairDivisionCategoryDescriptions: Record<AxiomCategory, string> = {
  efficiency: 'Properties about not wasting value',
  fairness: 'Properties about fair shares and envy',
  strategy: 'Properties about truthful reporting',
  monotonicity: 'Properties about resource changes',
  consistency: 'Properties about combining divisions',
};

const allocationCategoryDescriptions: Record<AxiomCategory, string> = {
  efficiency: 'Properties about using all available resources',
  fairness: 'Properties about fair shares and guarantees',
  strategy: 'Properties about truthful demand reporting',
  monotonicity: 'Properties about demand changes',
  consistency: 'Properties about combining allocations',
};

const matchingCategoryDescriptions: Record<AxiomCategory, string> = {
  efficiency: 'Properties about optimal matchings',
  fairness: 'Properties about stability and individual rationality',
  strategy: 'Properties about truthful preference reporting',
  monotonicity: 'Properties about preference changes',
  consistency: 'Properties about combining matchings',
};

function AxiomCheckbox({
  axiom,
  isSelected,
  onToggle,
  wouldEliminate,
  remainingMechanisms,
  allMechanisms,
}: {
  axiom: Axiom;
  isSelected: boolean;
  onToggle: () => void;
  wouldEliminate: boolean;
  remainingMechanisms: string[];
  allMechanisms: Mechanism[];
}) {
  return (
    <label
      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'bg-blue-50 border-blue-300'
          : wouldEliminate
            ? 'bg-red-50 border-red-200'
            : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-slate-800">{axiom.name}</span>
          {wouldEliminate && !isSelected && (
            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
              Eliminates all options
            </span>
          )}
        </div>

        {/* Plain language explanation (primary) */}
        <p className="text-sm text-slate-600 mt-1">
          {axiom.plainLanguage || axiom.description}
        </p>

        {/* Trade-off warning */}
        {axiom.tradeoffWarning && !isSelected && (
          <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded mt-2">
            {axiom.tradeoffWarning}
          </p>
        )}

        {/* Show which mechanisms would remain if selected */}
        {!isSelected && !wouldEliminate && remainingMechanisms.length < allMechanisms.length && (
          <p className="text-xs text-slate-500 mt-2">
            Selecting this leaves: {remainingMechanisms.map(id =>
              allMechanisms.find(m => m.id === id)?.name
            ).join(', ')}
          </p>
        )}

        {/* Expandable formal definition */}
        <details className="mt-2">
          <summary
            className="text-xs text-slate-500 cursor-pointer hover:text-slate-700"
            aria-label={`Show technical details about ${axiom.name}`}
          >
            {axiom.formalDefinition ? 'Technical definition' : 'More details'}
          </summary>
          <div className="text-xs text-slate-500 mt-1 pl-2 border-l-2 border-slate-200 space-y-1">
            <p>{axiom.description}</p>
            {axiom.formalDefinition && (
              <p className="font-mono text-xs">{axiom.formalDefinition}</p>
            )}
          </div>
        </details>
      </div>
    </label>
  );
}

function MechanismStatusCard({
  mechanism,
  isCompatible,
  failedAxiomsCount,
}: {
  mechanism: Mechanism;
  isCompatible: boolean;
  failedAxiomsCount: number;
}) {
  return (
    <div
      className={`text-sm p-2 rounded ${
        isCompatible
          ? 'bg-green-50 text-green-800 border border-green-200'
          : 'bg-slate-50 text-slate-400 border border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={isCompatible ? '' : 'line-through'}>{mechanism.name}</span>
        {isCompatible && <span className="text-green-600 text-xs">Available</span>}
      </div>
      {!isCompatible && failedAxiomsCount > 0 && (
        <p className="text-xs mt-1 text-slate-500">
          Fails: {failedAxiomsCount} selected axiom{failedAxiomsCount !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

export function AxiomSelect() {
  const navigate = useNavigate();
  const { session, toggleAxiom, setSelectedAxioms } = useSession();
  const { selectedAxioms, problemType } = session;

  const isFairDivision = problemType === 'fair-division';
  const isAllocation = problemType === 'allocation';
  const isMatching = problemType === 'matching';

  // Select the appropriate mechanisms and compatibility functions
  const mechanisms = isMatching
    ? matchingMechanisms
    : isAllocation
    ? allocationMechanisms
    : isFairDivision
    ? fairDivisionMechanisms
    : votingMechanisms;
  const getAxiomsForCategory = isMatching
    ? getMatchingAxiomsByCategory
    : isAllocation
    ? getAllocationAxiomsByCategory
    : isFairDivision
    ? getFairDivisionAxiomsByCategory
    : getAxiomsByCategory;
  const getCompatible = isMatching
    ? getCompatibleMatchingMechanisms
    : isAllocation
    ? getCompatibleAllocationMechanisms
    : isFairDivision
    ? getCompatibleFairDivisionMechanisms
    : getCompatibleMechanisms;
  const wouldEliminateAll = isMatching
    ? wouldEliminateAllMatchingMechanisms
    : isAllocation
    ? wouldEliminateAllAllocationMechanisms
    : isFairDivision
    ? wouldEliminateAllFairDivisionMechanisms
    : wouldEliminateAllMechanisms;
  const getFailed = isMatching
    ? getFailedMatchingAxioms
    : isAllocation
    ? getFailedAllocationAxioms
    : isFairDivision
    ? getFailedFairDivisionAxioms
    : getFailedAxioms;
  const categoryDescriptions = isMatching
    ? matchingCategoryDescriptions
    : isAllocation
    ? allocationCategoryDescriptions
    : isFairDivision
    ? fairDivisionCategoryDescriptions
    : votingCategoryDescriptions;

  const compatibleMechanisms = useMemo(
    () => getCompatible(selectedAxioms),
    [selectedAxioms, getCompatible]
  );

  // Only show categories that have axioms for this problem type
  const categories: AxiomCategory[] = useMemo(() => {
    const allCategories: AxiomCategory[] = ['efficiency', 'fairness', 'strategy', 'monotonicity', 'consistency'];
    return allCategories.filter((cat) => getAxiomsForCategory(cat).length > 0);
  }, [getAxiomsForCategory]);

  const handleContinue = () => {
    if (compatibleMechanisms.length > 0) {
      navigate('/mechanism');
    }
  };

  const handleClear = () => {
    setSelectedAxioms([]);
  };

  // Calculate which mechanisms would remain if a new axiom is selected
  const getMechanismsAfterSelection = (axiomId: string): string[] => {
    if (selectedAxioms.includes(axiomId)) {
      return compatibleMechanisms;
    }
    return getCompatible([...selectedAxioms, axiomId]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-slate-800">
            Which properties matter to your group?
          </h1>
        </div>
        <p className="text-slate-600 mb-6">
          Select the fairness axioms you want your {isMatching ? 'matching' : isAllocation ? 'allocation' : isFairDivision ? 'division' : 'decision'} mechanism to satisfy. As you
          select axioms, mechanisms that don't satisfy them will be eliminated.
        </p>

        <div className="space-y-6">
          {categories.map((category) => {
            const categoryAxioms = getAxiomsForCategory(category);
            if (categoryAxioms.length === 0) return null;

            return (
              <div key={category}>
                <h2 className="font-semibold text-slate-800 mb-1">
                  {categoryLabels[category]}
                </h2>
                <p className="text-sm text-slate-500 mb-3">
                  {categoryDescriptions[category]}
                </p>
                <div className="space-y-2">
                  {categoryAxioms.map((axiom) => (
                    <AxiomCheckbox
                      key={axiom.id}
                      axiom={axiom}
                      isSelected={selectedAxioms.includes(axiom.id)}
                      onToggle={() => toggleAxiom(axiom.id)}
                      wouldEliminate={
                        !selectedAxioms.includes(axiom.id) &&
                        wouldEliminateAll(selectedAxioms, axiom.id)
                      }
                      remainingMechanisms={getMechanismsAfterSelection(axiom.id)}
                      allMechanisms={mechanisms}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-4 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-800 mb-3">Mechanism Status</h2>
            {compatibleMechanisms.length === 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-red-700 font-medium">No mechanisms available</p>
                <p className="text-xs text-red-600 mt-1">
                  Your selected axioms are incompatible with all {isMatching ? 'matching' : isAllocation ? 'allocation' : isFairDivision ? 'fair division' : 'voting'} mechanisms.
                  {isAllocation || isFairDivision || isMatching
                    ? ' Try selecting fewer axioms or different combinations.'
                    : ' This often happens due to impossibility theorems in social choice theory.'}
                </p>
              </div>
            ) : null}
            <div className="space-y-2">
              {mechanisms.map((mech) => (
                <MechanismStatusCard
                  key={mech.id}
                  mechanism={mech}
                  isCompatible={compatibleMechanisms.includes(mech.id)}
                  failedAxiomsCount={getFailed(mech.id, selectedAxioms).length}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-800 mb-2">Selection Summary</h2>
            <p className="text-sm text-slate-600 mb-3">
              {selectedAxioms.length === 0
                ? `No axioms selected. All ${mechanisms.length} mechanisms available.`
                : `${selectedAxioms.length} axiom${selectedAxioms.length !== 1 ? 's' : ''} selected. ${compatibleMechanisms.length} of ${mechanisms.length} mechanism${compatibleMechanisms.length !== 1 ? 's' : ''} compatible.`}
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleContinue}
                disabled={compatibleMechanisms.length === 0}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
              {selectedAxioms.length > 0 && (
                <button
                  onClick={handleClear}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Matching-specific info */}
          {isMatching && (
            <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-4">
              <h3 className="font-medium text-indigo-800 text-sm mb-2">
                About Matching
              </h3>
              <p className="text-xs text-indigo-700 mb-2">
                Matching theory studies how to pair agents with each other or with resources based on preferences.
                The 2012 Nobel Prize in Economics was awarded to Alvin Roth and Lloyd Shapley for their work on stable allocations.
              </p>
              <p className="text-xs text-indigo-700">
                Key trade-off: Stability (no blocking pairs) vs Pareto efficiency (optimal welfare).
                Gale-Shapley achieves stability while TTC achieves Pareto efficiency.
              </p>
            </div>
          )}

          {/* Voting-specific impossibility theorems */}
          {!isFairDivision && !isMatching && (
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
              <h3 className="font-medium text-amber-800 text-sm mb-2">
                Why can't I have everything?
              </h3>
              <p className="text-xs text-amber-700 mb-2">
                <strong>Arrow's Impossibility Theorem:</strong> No ranked voting system with 3+
                candidates can simultaneously satisfy Pareto efficiency, IIA, and non-dictatorship.
              </p>
              <p className="text-xs text-amber-700">
                <strong>Gibbard-Satterthwaite:</strong> No non-dictatorial voting rule is fully
                strategyproof with 3+ candidates.
              </p>
            </div>
          )}

          {/* Fair division-specific info */}
          {isFairDivision && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-4">
              <h3 className="font-medium text-green-800 text-sm mb-2">
                About Fair Division
              </h3>
              <p className="text-xs text-green-700 mb-2">
                Fair division studies how to split resources among people with potentially different preferences.
                Key properties include proportionality (everyone gets at least 1/n) and envy-freeness (no one wants another's share).
              </p>
              <p className="text-xs text-green-700">
                Unlike voting, many fair division problems have solutions satisfying multiple strong properties simultaneously.
              </p>
            </div>
          )}

          {/* Allocation-specific info */}
          {isAllocation && (
            <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
              <h3 className="font-medium text-purple-800 text-sm mb-2">
                About Resource Allocation
              </h3>
              <p className="text-xs text-purple-700 mb-2">
                Resource allocation deals with dividing divisible resources (bandwidth, budget, computing time)
                among agents with different demands. Unlike fair division, agents specify how much they want.
              </p>
              <p className="text-xs text-purple-700">
                Key considerations include work conservation (use all resources if there's demand) and
                fairness guarantees (minimum shares regardless of others' demands).
              </p>
            </div>
          )}

          {/* Trade-offs guide */}
          {!isFairDivision && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h3 className="font-medium text-blue-800 text-sm mb-2">
                Understanding the trade-offs
              </h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>* <strong>Condorcet Winner</strong> = Only pairwise comparison works</li>
                <li>* <strong>Majority</strong> = Eliminates Borda and Approval</li>
                <li>* <strong>Monotonicity</strong> = Eliminates IRV</li>
                <li>* <strong>IIA</strong> = Eliminates everything (Arrow's theorem)</li>
              </ul>
            </div>
          )}

          {isFairDivision && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h3 className="font-medium text-blue-800 text-sm mb-2">
                Mechanism Comparison
              </h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>* <strong>Cut-and-Choose</strong> = Simple, 2-person, envy-free</li>
                <li>* <strong>Moving Knife</strong> = Works for any number of people</li>
                <li>* <strong>Adjusted Winner</strong> = Best for 2-person divisions with many items</li>
              </ul>
            </div>
          )}

          {isAllocation && (
            <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
              <h3 className="font-medium text-purple-800 text-sm mb-2">
                Mechanism Comparison
              </h3>
              <ul className="text-xs text-purple-700 space-y-1">
                <li>* <strong>Proportional Fairness</strong> = Allocates by demand ratio</li>
                <li>* <strong>Max-Min Fairness</strong> = Maximizes minimum allocation</li>
                <li>* <strong>Weighted Fair Queuing</strong> = Priority-based allocation</li>
              </ul>
            </div>
          )}

          {isMatching && (
            <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-4">
              <h3 className="font-medium text-indigo-800 text-sm mb-2">
                Mechanism Comparison
              </h3>
              <ul className="text-xs text-indigo-700 space-y-1">
                <li>* <strong>Gale-Shapley</strong> = Stable matching, proposer-optimal</li>
                <li>* <strong>Top Trading Cycle</strong> = Pareto efficient, strategy-proof</li>
                <li>* <strong>Serial Dictatorship</strong> = Simple priority-based assignment</li>
                <li>* <strong>Random Serial Dictatorship</strong> = Fair random priority</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

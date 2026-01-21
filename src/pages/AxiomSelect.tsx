import { useNavigate } from 'react-router-dom';
import { getAxiomsByCategory } from '../lib/axioms/voting';
import { votingMechanisms } from '../lib/mechanisms/voting';
import {
  getCompatibleMechanisms,
  wouldEliminateAllMechanisms,
  getFailedAxioms,
} from '../lib/compatibility/voting';
import { useSession } from '../hooks/useSession';
import type { Axiom, AxiomCategory } from '../types';

const categoryLabels: Record<AxiomCategory, string> = {
  efficiency: 'Efficiency',
  fairness: 'Fairness',
  strategy: 'Strategic',
  monotonicity: 'Monotonicity',
  consistency: 'Consistency',
};

const categoryDescriptions: Record<AxiomCategory, string> = {
  efficiency: 'Properties about choosing good outcomes',
  fairness: 'Properties about treating voters and candidates equally',
  strategy: 'Properties about honest voting behavior',
  monotonicity: 'Properties about how results respond to changes',
  consistency: 'Properties about combining or comparing elections',
};

function AxiomCheckbox({
  axiom,
  isSelected,
  onToggle,
  wouldEliminate,
  remainingMechanisms,
}: {
  axiom: Axiom;
  isSelected: boolean;
  onToggle: () => void;
  wouldEliminate: boolean;
  remainingMechanisms: string[];
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
        {!isSelected && !wouldEliminate && remainingMechanisms.length < votingMechanisms.length && (
          <p className="text-xs text-slate-500 mt-2">
            Selecting this leaves: {remainingMechanisms.map(id =>
              votingMechanisms.find(m => m.id === id)?.name
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
  selectedAxioms,
}: {
  mechanism: typeof votingMechanisms[0];
  isCompatible: boolean;
  selectedAxioms: string[];
}) {
  const failedAxioms = getFailedAxioms(mechanism.id, selectedAxioms);

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
      {!isCompatible && failedAxioms.length > 0 && (
        <p className="text-xs mt-1 text-slate-500">
          Fails: {failedAxioms.length} selected axiom{failedAxioms.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

export function AxiomSelect() {
  const navigate = useNavigate();
  const { session, toggleAxiom, setSelectedAxioms } = useSession();
  const { selectedAxioms } = session;

  const compatibleMechanisms = getCompatibleMechanisms(selectedAxioms);

  const categories: AxiomCategory[] = [
    'efficiency',
    'fairness',
    'strategy',
    'monotonicity',
    'consistency',
  ];

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
    return getCompatibleMechanisms([...selectedAxioms, axiomId]);
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
          Select the fairness axioms you want your decision mechanism to satisfy. As you
          select axioms, mechanisms that don't satisfy them will be eliminated.
        </p>

        <div className="space-y-6">
          {categories.map((category) => {
            const categoryAxioms = getAxiomsByCategory(category);
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
                        wouldEliminateAllMechanisms(selectedAxioms, axiom.id)
                      }
                      remainingMechanisms={getMechanismsAfterSelection(axiom.id)}
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
                  Your selected axioms are incompatible with all voting mechanisms.
                  This often happens due to impossibility theorems in social choice theory.
                </p>
              </div>
            ) : null}
            <div className="space-y-2">
              {votingMechanisms.map((mech) => (
                <MechanismStatusCard
                  key={mech.id}
                  mechanism={mech}
                  isCompatible={compatibleMechanisms.includes(mech.id)}
                  selectedAxioms={selectedAxioms}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-800 mb-2">Selection Summary</h2>
            <p className="text-sm text-slate-600 mb-3">
              {selectedAxioms.length === 0
                ? `No axioms selected. All ${votingMechanisms.length} mechanisms available.`
                : `${selectedAxioms.length} axiom${selectedAxioms.length !== 1 ? 's' : ''} selected. ${compatibleMechanisms.length} of ${votingMechanisms.length} mechanism${compatibleMechanisms.length !== 1 ? 's' : ''} compatible.`}
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

          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <h3 className="font-medium text-blue-800 text-sm mb-2">
              Understanding the trade-offs
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Condorcet Winner</strong> = Only pairwise comparison works</li>
              <li>• <strong>Majority</strong> = Eliminates Borda and Approval</li>
              <li>• <strong>Monotonicity</strong> = Eliminates IRV</li>
              <li>• <strong>IIA</strong> = Eliminates everything (Arrow's theorem)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

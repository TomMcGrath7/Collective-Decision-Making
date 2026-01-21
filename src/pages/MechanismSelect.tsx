import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { votingMechanisms } from '../lib/mechanisms/voting';
import { votingAxioms } from '../lib/axioms/voting';
import {
  getCompatibleMechanisms,
  getFailedAxioms,
  mechanismSatisfiesAxiom,
} from '../lib/compatibility/voting';
import { useSession } from '../hooks/useSession';
import type { Mechanism } from '../types';

function MechanismCard({
  mechanism,
  isCompatible,
  isSelected,
  selectedAxioms,
  failedAxioms,
  onSelect,
  showAllMode,
}: {
  mechanism: Mechanism;
  isCompatible: boolean;
  isSelected: boolean;
  selectedAxioms: string[];
  failedAxioms: string[];
  onSelect: () => void;
  showAllMode: boolean;
}) {
  // In show all mode, display all axioms; otherwise only show selected ones
  const axiomsToShow = showAllMode
    ? votingAxioms.filter((a) => a.applicableTo.includes('voting'))
    : votingAxioms.filter((a) => selectedAxioms.includes(a.id));

  return (
    <div
      onClick={isCompatible ? onSelect : undefined}
      className={`text-left p-4 rounded-lg border transition-all w-full ${
        isSelected
          ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200 cursor-pointer'
          : isCompatible
            ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm cursor-pointer'
            : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className={`font-semibold mb-1 ${isCompatible ? 'text-slate-800' : 'text-slate-500'}`}>
            {mechanism.name}
          </h3>
          {!isCompatible && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
              Incompatible with selected axioms
            </span>
          )}
        </div>
        {isSelected && (
          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Selected</span>
        )}
      </div>

      <p className={`text-sm mt-2 mb-3 ${isCompatible ? 'text-slate-600' : 'text-slate-400'}`}>
        {mechanism.description}
      </p>

      <details className="mb-3">
        <summary
          className={`text-sm cursor-pointer ${isCompatible ? 'text-slate-500 hover:text-slate-700' : 'text-slate-400'}`}
          aria-label={`Show how ${mechanism.name} works`}
        >
          How it works
        </summary>
        <p className={`text-sm mt-2 pl-3 border-l-2 ${isCompatible ? 'text-slate-600 border-slate-200' : 'text-slate-400 border-slate-100'}`}>
          {mechanism.howItWorks}
        </p>
      </details>

      {/* Axiom satisfaction badges */}
      <div className="flex flex-wrap gap-1.5">
        {axiomsToShow.length > 0 ? (
          axiomsToShow.map((axiom) => {
            const satisfied = mechanismSatisfiesAxiom(mechanism.id, axiom.id);
            const isRequired = selectedAxioms.includes(axiom.id);
            return (
              <span
                key={axiom.id}
                className={`text-xs px-2 py-0.5 rounded ${
                  satisfied
                    ? isRequired
                      ? 'bg-green-100 text-green-700 font-medium'
                      : 'bg-green-50 text-green-600'
                    : isRequired
                      ? 'bg-red-100 text-red-700 font-medium'
                      : 'bg-slate-100 text-slate-500'
                }`}
                title={axiom.description}
              >
                {satisfied ? '✓' : '✗'} {axiom.name}
              </span>
            );
          })
        ) : (
          <span className="text-xs text-slate-500">
            Satisfies {mechanism.satisfiedAxioms.length} of {votingAxioms.length} axioms
          </span>
        )}
      </div>

      {/* Show why this mechanism was filtered out */}
      {!isCompatible && failedAxioms.length > 0 && (
        <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-700">
          <strong>Why filtered:</strong> Does not satisfy{' '}
          {failedAxioms.map((id) => votingAxioms.find((a) => a.id === id)?.name).join(', ')}
        </div>
      )}
    </div>
  );
}

export function MechanismSelect() {
  const navigate = useNavigate();
  const { session, setMechanism } = useSession();
  const { selectedAxioms, selectedMechanism } = session;
  const [showAll, setShowAll] = useState(false);

  const compatibleMechanisms = getCompatibleMechanisms(selectedAxioms);
  const incompatibleMechanisms = votingMechanisms.filter(
    (m) => !compatibleMechanisms.includes(m.id)
  );

  const handleSelect = (mechanismId: string) => {
    if (compatibleMechanisms.includes(mechanismId)) {
      setMechanism(mechanismId);
    }
  };

  const handleContinue = () => {
    if (selectedMechanism) {
      navigate('/input');
    }
  };

  const handleBack = () => {
    navigate('/axioms');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-slate-800">Choose a mechanism</h1>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-slate-600">Show all axioms (educational mode)</span>
        </label>
      </div>

      {/* Summary of selected axioms and their impact */}
      {selectedAxioms.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
          <h2 className="font-medium text-slate-800 mb-2">Your Requirements</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedAxioms.map((axiomId) => {
              const axiom = votingAxioms.find((a) => a.id === axiomId);
              return (
                <span
                  key={axiomId}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                >
                  {axiom?.name}
                </span>
              );
            })}
          </div>
          <p className="text-sm text-slate-600">
            {compatibleMechanisms.length === votingMechanisms.length
              ? 'All mechanisms satisfy your selected axioms.'
              : compatibleMechanisms.length === 0
                ? 'No mechanisms satisfy all your selected axioms. Go back to adjust your requirements.'
                : `${compatibleMechanisms.length} of ${votingMechanisms.length} mechanisms satisfy all your requirements.`}
          </p>
          {incompatibleMechanisms.length > 0 && incompatibleMechanisms.length < votingMechanisms.length && (
            <p className="text-xs text-slate-500 mt-2">
              Filtered out: {incompatibleMechanisms.map((m) => m.name).join(', ')}
            </p>
          )}
        </div>
      )}

      {selectedAxioms.length === 0 && (
        <p className="text-slate-600 mb-6">
          No axioms selected - all mechanisms are available. Each mechanism has different
          trade-offs. Toggle "Show all axioms" to compare their properties.
        </p>
      )}

      {/* Compatible mechanisms */}
      {compatibleMechanisms.length > 0 && (
        <>
          <h2 className="font-semibold text-slate-800 mb-3">
            {selectedAxioms.length > 0 ? 'Compatible Mechanisms' : 'All Mechanisms'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {votingMechanisms
              .filter((m) => compatibleMechanisms.includes(m.id))
              .map((mechanism) => (
                <MechanismCard
                  key={mechanism.id}
                  mechanism={mechanism}
                  isCompatible={true}
                  isSelected={selectedMechanism === mechanism.id}
                  selectedAxioms={selectedAxioms}
                  failedAxioms={[]}
                  onSelect={() => handleSelect(mechanism.id)}
                  showAllMode={showAll}
                />
              ))}
          </div>
        </>
      )}

      {/* Incompatible mechanisms (shown for educational purposes) */}
      {incompatibleMechanisms.length > 0 && (
        <>
          <h2 className="font-semibold text-slate-500 mb-3">
            Incompatible Mechanisms
            <span className="font-normal text-sm ml-2">(don't meet your requirements)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {incompatibleMechanisms.map((mechanism) => (
              <MechanismCard
                key={mechanism.id}
                mechanism={mechanism}
                isCompatible={false}
                isSelected={false}
                selectedAxioms={selectedAxioms}
                failedAxioms={getFailedAxioms(mechanism.id, selectedAxioms)}
                onSelect={() => {}}
                showAllMode={showAll}
              />
            ))}
          </div>
        </>
      )}

      <div className="flex justify-between">
        <button
          onClick={handleBack}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Back to Axioms
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedMechanism}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          Continue to Input
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import type { VotingProblem, VotingPreference, Candidate } from '../types';
import { votingMechanisms, runVotingMechanism } from '../lib/mechanisms/voting';
import { exampleScenarios } from '../lib/examples';

interface VoterInputProps {
  voterIndex: number;
  candidates: Candidate[];
  ranking: string[];
  onRankingChange: (ranking: string[]) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function VoterInput({
  voterIndex,
  candidates,
  ranking,
  onRankingChange,
  onRemove,
  canRemove,
}: VoterInputProps) {
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newRanking = [...ranking];
    [newRanking[index - 1], newRanking[index]] = [newRanking[index], newRanking[index - 1]];
    onRankingChange(newRanking);
  };

  const moveDown = (index: number) => {
    if (index === ranking.length - 1) return;
    const newRanking = [...ranking];
    [newRanking[index], newRanking[index + 1]] = [newRanking[index + 1], newRanking[index]];
    onRankingChange(newRanking);
  };

  const getCandidateName = (id: string) => candidates.find((c) => c.id === id)?.name || id;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-slate-800">Voter {voterIndex + 1}</h3>
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-2">Drag or use arrows to rank (top = most preferred)</p>
      <div className="space-y-1">
        {ranking.map((candidateId, index) => (
          <div
            key={candidateId}
            className="flex items-center gap-2 bg-slate-50 rounded px-3 py-2"
          >
            <span className="text-sm font-medium text-slate-400 w-5">{index + 1}.</span>
            <span className="flex-1 text-slate-700">{getCandidateName(candidateId)}</span>
            <div className="flex gap-1">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed p-1"
              >
                ↑
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === ranking.length - 1}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed p-1"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VotingInput() {
  const navigate = useNavigate();
  const { session, setProblem, setResult } = useSession();
  const { selectedMechanism } = session;

  const mechanism = votingMechanisms.find((m) => m.id === selectedMechanism);

  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: 'a', name: 'Option A' },
    { id: 'b', name: 'Option B' },
    { id: 'c', name: 'Option C' },
  ]);

  const [voters, setVoters] = useState<VotingPreference[]>([
    { voterId: '1', ranking: ['a', 'b', 'c'] },
    { voterId: '2', ranking: ['b', 'c', 'a'] },
    { voterId: '3', ranking: ['c', 'a', 'b'] },
  ]);

  const [newCandidateName, setNewCandidateName] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  const loadScenario = (scenarioId: string) => {
    const scenario = exampleScenarios.find((s) => s.id === scenarioId);
    if (!scenario) return;
    setCandidates(scenario.candidates);
    setVoters(scenario.voters);
    setShowExamples(false);
  };

  const addCandidate = () => {
    if (!newCandidateName.trim()) return;
    const id = crypto.randomUUID().slice(0, 8);
    const newCandidate = { id, name: newCandidateName.trim() };
    setCandidates([...candidates, newCandidate]);
    setVoters(voters.map((v) => ({ ...v, ranking: [...v.ranking, id] })));
    setNewCandidateName('');
  };

  const removeCandidate = (candidateId: string) => {
    if (candidates.length <= 2) return;
    setCandidates(candidates.filter((c) => c.id !== candidateId));
    setVoters(voters.map((v) => ({
      ...v,
      ranking: v.ranking.filter((id) => id !== candidateId),
    })));
  };

  const updateCandidateName = (candidateId: string, name: string) => {
    setCandidates(candidates.map((c) => (c.id === candidateId ? { ...c, name } : c)));
  };

  const addVoter = () => {
    const newVoter: VotingPreference = {
      voterId: crypto.randomUUID(),
      ranking: candidates.map((c) => c.id),
    };
    setVoters([...voters, newVoter]);
  };

  const removeVoter = (voterId: string) => {
    if (voters.length <= 2) return;
    setVoters(voters.filter((v) => v.voterId !== voterId));
  };

  const updateVoterRanking = (voterId: string, ranking: string[]) => {
    setVoters(voters.map((v) => (v.voterId === voterId ? { ...v, ranking } : v)));
  };

  const handleCalculate = () => {
    if (!selectedMechanism) return;

    const problem: VotingProblem = { candidates, voters };
    setProblem(problem);

    const result = runVotingMechanism(selectedMechanism, problem);
    setResult(result);

    navigate('/results');
  };

  const handleBack = () => {
    navigate('/mechanism');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Enter preferences</h1>
      <p className="text-slate-600 mb-4">
        Using <span className="font-medium">{mechanism?.name}</span>. Add candidates and
        have each voter rank them in order of preference.
      </p>

      {/* Example Scenarios Section */}
      <div className="mb-6">
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>{showExamples ? '▼' : '▶'}</span>
          Load an example scenario
        </button>

        {showExamples && (
          <div className="mt-3 bg-slate-50 rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-3">
              Try these famous examples from voting theory to see interesting phenomena:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {exampleScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => loadScenario(scenario.id)}
                  className="text-left p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <h4 className="font-medium text-slate-800 text-sm mb-1">{scenario.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{scenario.description}</p>
                  {scenario.highlightMechanism && (
                    <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                      Best shown with: {votingMechanisms.find((m) => m.id === scenario.highlightMechanism)?.name}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
            <h2 className="font-semibold text-slate-800 mb-3">Candidates / Options</h2>
            <div className="space-y-2 mb-3">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={candidate.name}
                    onChange={(e) => updateCandidateName(candidate.id, e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={() => removeCandidate(candidate.id)}
                    disabled={candidates.length <= 2}
                    className="text-red-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed p-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCandidateName}
                onChange={(e) => setNewCandidateName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCandidate()}
                placeholder="New candidate name"
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
              />
              <button
                onClick={addCandidate}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-sm hover:bg-slate-200"
              >
                Add
              </button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <h3 className="font-medium text-blue-800 text-sm mb-2">Tips</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Each voter should rank ALL candidates</li>
              <li>• Top position = most preferred</li>
              <li>• Use arrows to reorder preferences</li>
              <li>• Need at least 2 voters and 2 candidates</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800">Voter Preferences</h2>
            <button
              onClick={addVoter}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Add Voter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voters.map((voter, index) => (
              <VoterInput
                key={voter.voterId}
                voterIndex={index}
                candidates={candidates}
                ranking={voter.ranking}
                onRankingChange={(r) => updateVoterRanking(voter.voterId, r)}
                onRemove={() => removeVoter(voter.voterId)}
                canRemove={voters.length > 2}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleCalculate}
          disabled={candidates.length < 2 || voters.length < 2}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          Calculate Result
        </button>
      </div>
    </div>
  );
}

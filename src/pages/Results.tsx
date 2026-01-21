import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useSession } from '../hooks/useSession';
import { votingMechanisms, runVotingMechanism } from '../lib/mechanisms/voting';
import { votingAxioms } from '../lib/axioms/voting';
import type { VotingProblem, VotingResult } from '../types';

export function Results() {
  const navigate = useNavigate();
  const { session, resetSession } = useSession();
  const { selectedMechanism, selectedAxioms, problem, result } = session;

  const mechanism = votingMechanisms.find((m) => m.id === selectedMechanism);
  const votingProblem = problem as VotingProblem | null;
  const votingResult = result as VotingResult | null;

  // Compute results for all mechanisms for "What if?" comparison
  const allMechanismResults = useMemo(() => {
    if (!votingProblem) return [];
    return votingMechanisms.map((m) => {
      try {
        const result = runVotingMechanism(m.id, votingProblem);
        const winners = Array.isArray(result.winner) ? result.winner : [result.winner];
        const winnerNames = winners
          .map((id) => votingProblem.candidates.find((c) => c.id === id)?.name || id)
          .join(' & ');
        return {
          mechanism: m,
          result,
          winnerNames,
          isCurrent: m.id === selectedMechanism,
        };
      } catch (error) {
        console.error(
          'Failed to run voting mechanism for comparison:',
          { mechanismId: m.id, mechanismName: m.name, error }
        );
        return null;
      }
    }).filter((r): r is NonNullable<typeof r> => r !== null);
  }, [votingProblem, selectedMechanism]);

  // Trigger confetti on results display
  useEffect(() => {
    if (votingResult) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      });
    }
  }, [votingResult]);

  if (!mechanism || !votingProblem || !votingResult) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">No results to display.</p>
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-700"
        >
          Start over
        </button>
      </div>
    );
  }

  const getWinnerNames = () => {
    const winners = Array.isArray(votingResult.winner)
      ? votingResult.winner
      : [votingResult.winner];
    return winners
      .map((id) => votingProblem.candidates.find((c) => c.id === id)?.name || id)
      .join(' & ');
  };

  const handleStartOver = () => {
    resetSession();
    navigate('/');
  };

  const handleTryDifferentMechanism = () => {
    navigate('/mechanism');
  };

  const sortedCandidates = [...votingProblem.candidates].sort(
    (a, b) => (votingResult.scores[b.id] || 0) - (votingResult.scores[a.id] || 0)
  );

  const maxScore = Math.max(...Object.values(votingResult.scores));

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 mb-6">
        <p className="text-blue-100 text-sm mb-1">Winner using {mechanism.name}</p>
        <h1 className="text-3xl font-bold mb-2">{getWinnerNames()}</h1>
        {Array.isArray(votingResult.winner) && votingResult.winner.length > 1 && (
          <p className="text-blue-100 text-sm">Tie between multiple candidates</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-800 mb-3">Score Breakdown</h2>
          <div className="space-y-2">
            {sortedCandidates.map((candidate, index) => {
              const score = votingResult.scores[candidate.id] || 0;
              const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
              const isWinner = Array.isArray(votingResult.winner)
                ? votingResult.winner.includes(candidate.id)
                : votingResult.winner === candidate.id;

              return (
                <div key={candidate.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={isWinner ? 'font-medium text-blue-700' : 'text-slate-700'}>
                      {index + 1}. {candidate.name}
                      {isWinner && ' 🏆'}
                    </span>
                    <span className="text-slate-500">{score}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isWinner ? 'bg-blue-500' : 'bg-slate-300'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-800 mb-3">Configuration</h2>
          <dl className="text-sm space-y-2">
            <div>
              <dt className="text-slate-500">Mechanism</dt>
              <dd className="font-medium text-slate-800">{mechanism.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Voters</dt>
              <dd className="font-medium text-slate-800">{votingProblem.voters.length}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Candidates</dt>
              <dd className="font-medium text-slate-800">{votingProblem.candidates.length}</dd>
            </div>
            {selectedAxioms.length > 0 && (
              <div>
                <dt className="text-slate-500">Required Axioms</dt>
                <dd className="font-medium text-slate-800">
                  {selectedAxioms
                    .map((id) => votingAxioms.find((a) => a.id === id)?.name)
                    .join(', ')}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3">How the Result Was Calculated</h2>
        <div className="text-sm text-slate-600 whitespace-pre-line">
          {votingResult.explanation}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3">Voter Preferences Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 text-slate-500 font-medium">Voter</th>
                {votingProblem.candidates.map((_, i) => (
                  <th key={i} className="text-left py-2 text-slate-500 font-medium">
                    #{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {votingProblem.voters.map((voter, vIndex) => (
                <tr key={voter.voterId} className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">Voter {vIndex + 1}</td>
                  {voter.ranking.map((candidateId, rIndex) => {
                    const candidate = votingProblem.candidates.find(
                      (c) => c.id === candidateId
                    );
                    return (
                      <td key={rIndex} className="py-2 text-slate-600">
                        {candidate?.name}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-6">
        <h3 className="font-medium text-blue-800 mb-2">About {mechanism.name}</h3>
        <p className="text-sm text-blue-700 mb-2">{mechanism.howItWorks}</p>
        <details>
          <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">
            Satisfied fairness properties
          </summary>
          <ul className="mt-2 text-sm text-blue-700 space-y-1">
            {mechanism.satisfiedAxioms.map((axiomId) => {
              const axiom = votingAxioms.find((a) => a.id === axiomId);
              return axiom ? (
                <li key={axiomId}>
                  <span className="font-medium">{axiom.name}</span>: {axiom.description}
                </li>
              ) : null;
            })}
          </ul>
        </details>
      </div>

      {/* What If? Comparison Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <h2 className="font-semibold text-slate-800 mb-2">What If? Compare Mechanisms</h2>
        <p className="text-sm text-slate-500 mb-4">
          See how the same preferences would produce different results under different voting systems.
        </p>

        <div className="space-y-3">
          {allMechanismResults.map(({ mechanism: m, winnerNames, isCurrent, result: r }) => {
            const currentWinners = Array.isArray(votingResult.winner) ? votingResult.winner : [votingResult.winner];
            const otherWinners = Array.isArray(r.winner) ? r.winner : [r.winner];
            const sameWinner = currentWinners.length === otherWinners.length &&
              currentWinners.every((w) => otherWinners.includes(w));

            return (
              <div
                key={m.id}
                className={`p-3 rounded-lg border ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-200'
                    : sameWinner
                    ? 'bg-green-50 border-green-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        isCurrent ? 'text-blue-800' : sameWinner ? 'text-green-800' : 'text-amber-800'
                      }`}>
                        {m.name}
                      </span>
                      {isCurrent && (
                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className={`text-sm mt-1 ${
                      isCurrent ? 'text-blue-700' : sameWinner ? 'text-green-700' : 'text-amber-700'
                    }`}>
                      Winner: <span className="font-medium">{winnerNames}</span>
                    </div>
                  </div>
                  {!isCurrent && (
                    <div className={`text-xs px-2 py-1 rounded ${
                      sameWinner ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'
                    }`}>
                      {sameWinner ? 'Same winner' : 'Different winner'}
                    </div>
                  )}
                </div>
                {!isCurrent && !sameWinner && (
                  <details className="mt-2">
                    <summary className={`text-xs cursor-pointer ${
                      sameWinner ? 'text-green-600' : 'text-amber-600'
                    } hover:underline`}>
                      Why the difference?
                    </summary>
                    <p className={`text-xs mt-1 ${
                      sameWinner ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {m.id === 'plurality' && "Plurality only counts first-place votes, ignoring voters' full preferences."}
                      {m.id === 'borda' && "Borda Count assigns points to all rankings, rewarding broad acceptability over passionate support."}
                      {m.id === 'irv' && "IRV eliminates candidates round-by-round, which can produce different outcomes due to elimination order effects."}
                      {m.id === 'approval' && "Approval voting counts how many voters find each candidate acceptable (top half of their ranking)."}
                      {m.id === 'condorcet' && "Condorcet looks for who would win every head-to-head matchup, which may differ from other tallying methods."}
                    </p>
                  </details>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            This demonstrates a key insight from voting theory: <strong>the choice of voting mechanism can determine the winner</strong>,
            even with identical voter preferences. Different mechanisms embody different values about what makes a "fair" outcome.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={handleTryDifferentMechanism}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Try Different Mechanism
        </button>
        <button
          onClick={handleStartOver}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Start New Decision
        </button>
      </div>
    </div>
  );
}

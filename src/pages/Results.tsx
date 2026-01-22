import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useSession } from '../hooks/useSession';
import { votingMechanisms, runVotingMechanism } from '../lib/mechanisms/voting';
import { fairDivisionMechanisms, runFairDivisionMechanism } from '../lib/mechanisms/fairDivision';
import { allocationMechanisms, runAllocationMechanism } from '../lib/mechanisms/allocation';
import { votingAxioms } from '../lib/axioms/voting';
import { fairDivisionAxioms } from '../lib/axioms/fairDivision';
import { allocationAxioms } from '../lib/axioms/allocation';
import type { VotingProblem, VotingResult, FairDivisionProblem, FairDivisionResult, DivisibleAllocationProblem, DivisibleAllocationResult } from '../types';

function VotingResults({
  mechanism,
  problem,
  result,
  selectedAxioms,
  allMechanismResults,
}: {
  mechanism: typeof votingMechanisms[0];
  problem: VotingProblem;
  result: VotingResult;
  selectedAxioms: string[];
  allMechanismResults: Array<{
    mechanism: typeof votingMechanisms[0];
    result: VotingResult;
    winnerNames: string;
    isCurrent: boolean;
  }>;
}) {
  const getWinnerNames = () => {
    const winners = Array.isArray(result.winner) ? result.winner : [result.winner];
    return winners
      .map((id) => problem.candidates.find((c) => c.id === id)?.name || id)
      .join(' & ');
  };

  const sortedCandidates = [...problem.candidates].sort(
    (a, b) => (result.scores[b.id] || 0) - (result.scores[a.id] || 0)
  );

  const maxScore = Math.max(...Object.values(result.scores));

  return (
    <>
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 mb-6">
        <p className="text-blue-100 text-sm mb-1">Winner using {mechanism.name}</p>
        <h1 className="text-3xl font-bold mb-2">{getWinnerNames()}</h1>
        {Array.isArray(result.winner) && result.winner.length > 1 && (
          <p className="text-blue-100 text-sm">Tie between multiple candidates</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-800 mb-3">Score Breakdown</h2>
          <div className="space-y-2">
            {sortedCandidates.map((candidate, index) => {
              const score = result.scores[candidate.id] || 0;
              const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
              const isWinner = Array.isArray(result.winner)
                ? result.winner.includes(candidate.id)
                : result.winner === candidate.id;

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
              <dd className="font-medium text-slate-800">{problem.voters.length}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Candidates</dt>
              <dd className="font-medium text-slate-800">{problem.candidates.length}</dd>
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
          {result.explanation}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3">Voter Preferences Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 text-slate-500 font-medium">Voter</th>
                {problem.candidates.map((_, i) => (
                  <th key={i} className="text-left py-2 text-slate-500 font-medium">
                    #{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {problem.voters.map((voter, vIndex) => (
                <tr key={voter.voterId} className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">Voter {vIndex + 1}</td>
                  {voter.ranking.map((candidateId, rIndex) => {
                    const candidate = problem.candidates.find((c) => c.id === candidateId);
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
            const currentWinners = Array.isArray(result.winner) ? result.winner : [result.winner];
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
    </>
  );
}

function FairDivisionResults({
  mechanism,
  problem,
  result,
  selectedAxioms,
  allMechanismResults,
}: {
  mechanism: typeof fairDivisionMechanisms[0];
  problem: FairDivisionProblem;
  result: FairDivisionResult;
  selectedAxioms: string[];
  allMechanismResults: Array<{
    mechanism: typeof fairDivisionMechanisms[0];
    result: FairDivisionResult;
    isCurrent: boolean;
  }>;
}) {
  const getAgentName = (agentId: string) =>
    problem.agents.find((a) => a.id === agentId)?.name || agentId;

  // Generate colors for agents
  const agentColors = ['bg-blue-400', 'bg-green-400', 'bg-amber-400', 'bg-purple-400', 'bg-pink-400'];

  return (
    <>
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 mb-6">
        <p className="text-green-100 text-sm mb-1">Division using {mechanism.name}</p>
        <h1 className="text-3xl font-bold mb-2">{problem.good.name} Divided</h1>
        <p className="text-green-100 text-sm">
          {problem.agents.length} participants, each receiving their fair share
        </p>
      </div>

      {/* Visual Division Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3">Division Visualization</h2>
        <div className="relative h-12 bg-slate-100 rounded-lg overflow-hidden mb-4">
          {result.allocations.map((allocation, index) => {
            const agent = problem.agents.find((a) => a.id === allocation.agentId);
            return allocation.intervals.map((interval, iIndex) => (
              <div
                key={`${allocation.agentId}-${iIndex}`}
                className={`absolute top-0 bottom-0 flex items-center justify-center text-white font-medium text-sm ${agentColors[index % agentColors.length]}`}
                style={{
                  left: `${interval.start}%`,
                  width: `${interval.end - interval.start}%`,
                }}
              >
                {agent?.name}
              </div>
            ));
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Allocation Table */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-800 mb-3">Allocation Summary</h2>
          <div className="space-y-3">
            {result.allocations.map((allocation, index) => (
              <div key={allocation.agentId} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${agentColors[index % agentColors.length]}`} />
                <div className="flex-1">
                  <div className="font-medium text-slate-800">
                    {getAgentName(allocation.agentId)}
                  </div>
                  <div className="text-sm text-slate-500">
                    {allocation.intervals.map((i) => `${i.start}%-${i.end}%`).join(', ')} ({allocation.percentageReceived}%)
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-slate-800">{allocation.valueReceived}%</div>
                  <div className="text-xs text-slate-500">value received</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-800 mb-3">Configuration</h2>
          <dl className="text-sm space-y-2">
            <div>
              <dt className="text-slate-500">Mechanism</dt>
              <dd className="font-medium text-slate-800">{mechanism.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Good</dt>
              <dd className="font-medium text-slate-800">{problem.good.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Participants</dt>
              <dd className="font-medium text-slate-800">{problem.agents.length}</dd>
            </div>
            {problem.cutterAgentId && (
              <div>
                <dt className="text-slate-500">Cutter</dt>
                <dd className="font-medium text-slate-800">{getAgentName(problem.cutterAgentId)}</dd>
              </div>
            )}
            {selectedAxioms.length > 0 && (
              <div>
                <dt className="text-slate-500">Required Axioms</dt>
                <dd className="font-medium text-slate-800">
                  {selectedAxioms
                    .map((id) => fairDivisionAxioms.find((a) => a.id === id)?.name)
                    .join(', ')}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Fairness Properties */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3">Fairness Properties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.fairnessProperties.map((prop) => (
            <div
              key={prop.property}
              className={`p-3 rounded-lg border ${
                prop.satisfied
                  ? 'bg-green-50 border-green-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={prop.satisfied ? 'text-green-600' : 'text-slate-400'}>
                  {prop.satisfied ? '✓' : '✗'}
                </span>
                <span className={`font-medium ${prop.satisfied ? 'text-green-800' : 'text-slate-600'}`}>
                  {prop.property}
                </span>
              </div>
              <p className={`text-xs ${prop.satisfied ? 'text-green-700' : 'text-slate-500'}`}>
                {prop.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Explanation */}
      {result.steps && result.steps.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <h2 className="font-semibold text-slate-800 mb-3">Step-by-Step Process</h2>
          <div className="space-y-3">
            {result.steps.map((step) => (
              <div key={step.step} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">
                  {step.step}
                </div>
                <div>
                  <p className="text-sm text-slate-700">{step.description}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Actor: {getAgentName(step.actor)} | Action: {step.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3">How the Result Was Calculated</h2>
        <div className="text-sm text-slate-600 whitespace-pre-line">
          {result.explanation}
        </div>
      </div>

      <div className="bg-green-50 rounded-lg border border-green-200 p-4 mb-6">
        <h3 className="font-medium text-green-800 mb-2">About {mechanism.name}</h3>
        <p className="text-sm text-green-700 mb-2">{mechanism.howItWorks}</p>
        <details>
          <summary className="text-sm text-green-600 cursor-pointer hover:text-green-700">
            Satisfied fairness axioms
          </summary>
          <ul className="mt-2 text-sm text-green-700 space-y-1">
            {mechanism.satisfiedAxioms.map((axiomId) => {
              const axiom = fairDivisionAxioms.find((a) => a.id === axiomId);
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
          See how the same division problem would be handled by different fair division mechanisms.
        </p>

        <div className="space-y-3">
          {allMechanismResults.map(({ mechanism: m, isCurrent, result: r }) => {
            // Check if results are similar (same percentages)
            const currentPercentages = result.allocations.map((a) => a.percentageReceived).sort();
            const otherPercentages = r.allocations.map((a) => a.percentageReceived).sort();
            const sameResult = currentPercentages.length === otherPercentages.length &&
              currentPercentages.every((p, i) => Math.abs(p - otherPercentages[i]) < 0.1);

            return (
              <div
                key={m.id}
                className={`p-3 rounded-lg border ${
                  isCurrent
                    ? 'bg-green-50 border-green-200'
                    : sameResult
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        isCurrent ? 'text-green-800' : sameResult ? 'text-blue-800' : 'text-amber-800'
                      }`}>
                        {m.name}
                      </span>
                      {isCurrent && (
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className={`text-sm mt-1 ${
                      isCurrent ? 'text-green-700' : sameResult ? 'text-blue-700' : 'text-amber-700'
                    }`}>
                      Division: {r.allocations.map((a) => `${a.percentageReceived}%`).join(' / ')}
                    </div>
                    <div className={`text-xs mt-1 ${
                      isCurrent ? 'text-green-600' : sameResult ? 'text-blue-600' : 'text-amber-600'
                    }`}>
                      Properties: {r.fairnessProperties.filter((p) => p.satisfied).map((p) => p.property).join(', ')}
                    </div>
                  </div>
                  {!isCurrent && (
                    <div className={`text-xs px-2 py-1 rounded ${
                      sameResult ? 'bg-blue-200 text-blue-800' : 'bg-amber-200 text-amber-800'
                    }`}>
                      {sameResult ? 'Same division' : 'Different approach'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Different fair division mechanisms make different trade-offs between fairness properties.
            With uniform valuations, most mechanisms produce similar results, but with different preferences,
            the choice of mechanism can significantly affect who gets what.
          </p>
        </div>
      </div>
    </>
  );
}

function AllocationResults({
  mechanism,
  problem,
  result,
  selectedAxioms,
  allMechanismResults,
}: {
  mechanism: typeof allocationMechanisms[0];
  problem: DivisibleAllocationProblem;
  result: DivisibleAllocationResult;
  selectedAxioms: string[];
  allMechanismResults: Array<{
    mechanism: typeof allocationMechanisms[0];
    result: DivisibleAllocationResult;
    isCurrent: boolean;
  }>;
}) {
  const getAgentName = (agentId: string) =>
    problem.agents.find((a) => a.id === agentId)?.name || agentId;

  // Generate colors for agents
  const agentColors = ['bg-purple-400', 'bg-blue-400', 'bg-green-400', 'bg-amber-400', 'bg-pink-400', 'bg-cyan-400'];

  const totalDemand = problem.agents.reduce((sum, a) => sum + a.demand, 0);
  const totalAllocated = result.allocations.reduce((sum, a) => sum + a.amountReceived, 0);

  return (
    <>
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 mb-6">
        <p className="text-purple-100 text-sm mb-1">Allocation using {mechanism.name}</p>
        <h1 className="text-3xl font-bold mb-2">{problem.resource.name} Allocated</h1>
        <p className="text-purple-100 text-sm">
          {totalAllocated.toFixed(2)} of {problem.resource.totalAmount} {problem.resource.unit} distributed among {problem.agents.length} participants
        </p>
      </div>

      {/* Visual Allocation Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3">Allocation Visualization</h2>
        <div className="relative h-12 bg-slate-100 rounded-lg overflow-hidden mb-4">
          {result.allocations.map((allocation, index) => {
            const startPercent = result.allocations
              .slice(0, index)
              .reduce((sum, a) => sum + a.percentageOfTotal, 0);
            return (
              <div
                key={allocation.agentId}
                className={`absolute top-0 bottom-0 flex items-center justify-center text-white font-medium text-sm ${agentColors[index % agentColors.length]}`}
                style={{
                  left: `${startPercent}%`,
                  width: `${allocation.percentageOfTotal}%`,
                }}
              >
                {allocation.percentageOfTotal > 8 && getAgentName(allocation.agentId)}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Allocation Table */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-800 mb-3">Allocation Summary</h2>
          <div className="space-y-3">
            {result.allocations.map((allocation, index) => {
              const agent = problem.agents.find((a) => a.id === allocation.agentId)!;
              return (
                <div key={allocation.agentId} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${agentColors[index % agentColors.length]}`} />
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">
                      {getAgentName(allocation.agentId)}
                    </div>
                    <div className="text-sm text-slate-500">
                      Demanded: {agent.demand} {problem.resource.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-slate-800">
                      {allocation.amountReceived.toFixed(2)} {problem.resource.unit}
                    </div>
                    <div className="text-xs text-slate-500">
                      {allocation.percentageOfDemand.toFixed(1)}% satisfied
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-800 mb-3">Configuration</h2>
          <dl className="text-sm space-y-2">
            <div>
              <dt className="text-slate-500">Mechanism</dt>
              <dd className="font-medium text-slate-800">{mechanism.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Resource</dt>
              <dd className="font-medium text-slate-800">{problem.resource.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Total Available</dt>
              <dd className="font-medium text-slate-800">{problem.resource.totalAmount} {problem.resource.unit}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Total Demand</dt>
              <dd className="font-medium text-slate-800">{totalDemand} {problem.resource.unit}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Participants</dt>
              <dd className="font-medium text-slate-800">{problem.agents.length}</dd>
            </div>
            {selectedAxioms.length > 0 && (
              <div>
                <dt className="text-slate-500">Required Axioms</dt>
                <dd className="font-medium text-slate-800">
                  {selectedAxioms
                    .map((id) => allocationAxioms.find((a) => a.id === id)?.name)
                    .join(', ')}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Fairness Properties */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3">Fairness Properties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.fairnessProperties.map((prop) => (
            <div
              key={prop.property}
              className={`p-3 rounded-lg border ${
                prop.satisfied
                  ? 'bg-green-50 border-green-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={prop.satisfied ? 'text-green-600' : 'text-slate-400'}>
                  {prop.satisfied ? '✓' : '✗'}
                </span>
                <span className={`font-medium ${prop.satisfied ? 'text-green-800' : 'text-slate-600'}`}>
                  {prop.property}
                </span>
              </div>
              <p className={`text-xs ${prop.satisfied ? 'text-green-700' : 'text-slate-500'}`}>
                {prop.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Explanation */}
      {result.steps && result.steps.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <h2 className="font-semibold text-slate-800 mb-3">Step-by-Step Process</h2>
          <div className="space-y-3">
            {result.steps.map((step) => (
              <div key={step.step} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-medium">
                  {step.step}
                </div>
                <div>
                  <p className="text-sm text-slate-700">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3">How the Result Was Calculated</h2>
        <div className="text-sm text-slate-600 whitespace-pre-line">
          {result.explanation}
        </div>
      </div>

      <div className="bg-purple-50 rounded-lg border border-purple-200 p-4 mb-6">
        <h3 className="font-medium text-purple-800 mb-2">About {mechanism.name}</h3>
        <p className="text-sm text-purple-700 mb-2">{mechanism.howItWorks}</p>
        <details>
          <summary className="text-sm text-purple-600 cursor-pointer hover:text-purple-700">
            Satisfied fairness axioms
          </summary>
          <ul className="mt-2 text-sm text-purple-700 space-y-1">
            {mechanism.satisfiedAxioms.map((axiomId) => {
              const axiom = allocationAxioms.find((a) => a.id === axiomId);
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
          See how the same allocation problem would be handled by different allocation mechanisms.
        </p>

        <div className="space-y-3">
          {allMechanismResults.map(({ mechanism: m, isCurrent, result: r }) => {
            // Check if results are similar (same percentages)
            const currentPercentages = result.allocations.map((a) => a.percentageOfTotal).sort((x, y) => x - y);
            const otherPercentages = r.allocations.map((a) => a.percentageOfTotal).sort((x, y) => x - y);
            const sameResult = currentPercentages.length === otherPercentages.length &&
              currentPercentages.every((p, i) => Math.abs(p - otherPercentages[i]) < 1);

            return (
              <div
                key={m.id}
                className={`p-3 rounded-lg border ${
                  isCurrent
                    ? 'bg-purple-50 border-purple-200'
                    : sameResult
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        isCurrent ? 'text-purple-800' : sameResult ? 'text-blue-800' : 'text-amber-800'
                      }`}>
                        {m.name}
                      </span>
                      {isCurrent && (
                        <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className={`text-sm mt-1 ${
                      isCurrent ? 'text-purple-700' : sameResult ? 'text-blue-700' : 'text-amber-700'
                    }`}>
                      Allocation: {r.allocations.map((a) => `${a.amountReceived.toFixed(1)}`).join(' / ')} {problem.resource.unit}
                    </div>
                    <div className={`text-xs mt-1 ${
                      isCurrent ? 'text-purple-600' : sameResult ? 'text-blue-600' : 'text-amber-600'
                    }`}>
                      Properties: {r.fairnessProperties.filter((p) => p.satisfied).map((p) => p.property).join(', ')}
                    </div>
                  </div>
                  {!isCurrent && (
                    <div className={`text-xs px-2 py-1 rounded ${
                      sameResult ? 'bg-blue-200 text-blue-800' : 'bg-amber-200 text-amber-800'
                    }`}>
                      {sameResult ? 'Similar allocation' : 'Different allocation'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Different allocation mechanisms make different trade-offs between fairness properties.
            When demand exceeds supply, the choice of mechanism significantly affects who gets what.
          </p>
        </div>
      </div>
    </>
  );
}

export function Results() {
  const navigate = useNavigate();
  const { session, resetSession } = useSession();
  const { problemType, selectedMechanism, selectedAxioms, problem, result } = session;

  const isVoting = problemType === 'voting';
  const isFairDivision = problemType === 'fair-division';
  const isAllocation = problemType === 'allocation';

  const votingMechanism = isVoting ? votingMechanisms.find((m) => m.id === selectedMechanism) : null;
  const fairDivisionMechanism = isFairDivision ? fairDivisionMechanisms.find((m) => m.id === selectedMechanism) : null;
  const allocationMechanism = isAllocation ? allocationMechanisms.find((m) => m.id === selectedMechanism) : null;

  const votingProblem = isVoting ? (problem as VotingProblem | null) : null;
  const votingResult = isVoting ? (result as VotingResult | null) : null;

  const fairDivisionProblem = isFairDivision ? (problem as FairDivisionProblem | null) : null;
  const fairDivisionResult = isFairDivision ? (result as FairDivisionResult | null) : null;

  const allocationProblem = isAllocation ? (problem as DivisibleAllocationProblem | null) : null;
  const allocationResult = isAllocation ? (result as DivisibleAllocationResult | null) : null;

  // Compute results for all voting mechanisms for "What if?" comparison
  const allVotingMechanismResults = useMemo(() => {
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

  // Compute results for all fair division mechanisms for "What if?" comparison
  const allFairDivisionMechanismResults = useMemo(() => {
    if (!fairDivisionProblem) return [];

    // Filter mechanisms based on agent count
    const applicableMechanisms = fairDivisionMechanisms.filter((m) => {
      if (m.id === 'cut-and-choose' || m.id === 'adjusted-winner') {
        return fairDivisionProblem.agents.length === 2;
      }
      return true;
    });

    return applicableMechanisms.map((m) => {
      try {
        const result = runFairDivisionMechanism(m.id, fairDivisionProblem);
        return {
          mechanism: m,
          result,
          isCurrent: m.id === selectedMechanism,
        };
      } catch (error) {
        console.error(
          'Failed to run fair division mechanism for comparison:',
          { mechanismId: m.id, mechanismName: m.name, error }
        );
        return null;
      }
    }).filter((r): r is NonNullable<typeof r> => r !== null);
  }, [fairDivisionProblem, selectedMechanism]);

  // Compute results for all allocation mechanisms for "What if?" comparison
  const allAllocationMechanismResults = useMemo(() => {
    if (!allocationProblem) return [];

    return allocationMechanisms.map((m) => {
      try {
        const result = runAllocationMechanism(m.id, allocationProblem);
        return {
          mechanism: m,
          result,
          isCurrent: m.id === selectedMechanism,
        };
      } catch (error) {
        console.error(
          'Failed to run allocation mechanism for comparison:',
          { mechanismId: m.id, mechanismName: m.name, error }
        );
        return null;
      }
    }).filter((r): r is NonNullable<typeof r> => r !== null);
  }, [allocationProblem, selectedMechanism]);

  // Trigger confetti on results display
  useEffect(() => {
    if (votingResult || fairDivisionResult || allocationResult) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      });
    }
  }, [votingResult, fairDivisionResult, allocationResult]);

  const handleStartOver = () => {
    resetSession();
    navigate('/');
  };

  const handleTryDifferentMechanism = () => {
    navigate('/mechanism');
  };

  // Check if we have valid data
  const hasVotingData = isVoting && votingMechanism && votingProblem && votingResult;
  const hasFairDivisionData = isFairDivision && fairDivisionMechanism && fairDivisionProblem && fairDivisionResult;
  const hasAllocationData = isAllocation && allocationMechanism && allocationProblem && allocationResult;

  if (!hasVotingData && !hasFairDivisionData && !hasAllocationData) {
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

  return (
    <div className="max-w-3xl mx-auto">
      {hasVotingData && (
        <VotingResults
          mechanism={votingMechanism}
          problem={votingProblem}
          result={votingResult}
          selectedAxioms={selectedAxioms}
          allMechanismResults={allVotingMechanismResults}
        />
      )}

      {hasFairDivisionData && (
        <FairDivisionResults
          mechanism={fairDivisionMechanism}
          problem={fairDivisionProblem}
          result={fairDivisionResult}
          selectedAxioms={selectedAxioms}
          allMechanismResults={allFairDivisionMechanismResults}
        />
      )}

      {hasAllocationData && (
        <AllocationResults
          mechanism={allocationMechanism}
          problem={allocationProblem}
          result={allocationResult}
          selectedAxioms={selectedAxioms}
          allMechanismResults={allAllocationMechanismResults}
        />
      )}

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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import type { FairDivisionProblem, Agent, DivisibleGood } from '../types';
import { fairDivisionMechanisms, runFairDivisionMechanism } from '../lib/mechanisms/fairDivision';
import { generateUUID } from '../lib/utils/uuid';

export function FairDivisionInput() {
  const navigate = useNavigate();
  const { session, setProblem, setResult } = useSession();
  const { selectedMechanism } = session;

  const mechanism = fairDivisionMechanisms.find((m) => m.id === selectedMechanism);

  const [goodName, setGoodName] = useState('Cake');
  const [goodDescription, setGoodDescription] = useState('');

  const [agents, setAgents] = useState<Agent[]>([
    { id: 'agent-1', name: 'Person A' },
    { id: 'agent-2', name: 'Person B' },
  ]);

  const [cutterAgentId, setCutterAgentId] = useState<string>('agent-1');
  const [newAgentName, setNewAgentName] = useState('');

  const addAgent = () => {
    if (!newAgentName.trim()) return;
    const id = `agent-${generateUUID().slice(0, 8)}`;
    setAgents([...agents, { id, name: newAgentName.trim() }]);
    setNewAgentName('');
  };

  const removeAgent = (agentId: string) => {
    if (agents.length <= 2) return;
    setAgents(agents.filter((a) => a.id !== agentId));
    // Update cutter if the removed agent was the cutter
    if (cutterAgentId === agentId) {
      setCutterAgentId(agents.find((a) => a.id !== agentId)?.id || '');
    }
  };

  const updateAgentName = (agentId: string, name: string) => {
    setAgents(agents.map((a) => (a.id === agentId ? { ...a, name } : a)));
  };

  const handleCalculate = () => {
    if (!selectedMechanism) return;

    const good: DivisibleGood = {
      id: 'good-1',
      name: goodName,
      description: goodDescription || undefined,
    };

    // For uniform valuations, all agents value the good equally (100 each)
    const valuations: Record<string, number> = {};
    agents.forEach((agent) => {
      valuations[agent.id] = 100;
    });

    const problem: FairDivisionProblem = {
      agents,
      good,
      valuations,
      cutterAgentId: selectedMechanism === 'cut-and-choose' ? cutterAgentId : undefined,
    };

    setProblem(problem);

    const result = runFairDivisionMechanism(selectedMechanism, problem);
    setResult(result);

    navigate('/results');
  };

  const handleBack = () => {
    navigate('/mechanism');
  };

  // Determine if mechanism requires exactly 2 agents
  const requiresTwoAgents = selectedMechanism === 'cut-and-choose' || selectedMechanism === 'adjusted-winner';
  const canAddAgent = !requiresTwoAgents;
  const canRemoveAgent = agents.length > 2;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Set up the division</h1>
      <p className="text-slate-600 mb-6">
        Using <span className="font-medium">{mechanism?.name}</span>. Define what's being divided
        and who the participants are.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {/* Good being divided */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-800 mb-3">What's being divided?</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Name</label>
                <input
                  type="text"
                  value={goodName}
                  onChange={(e) => setGoodName(e.target.value)}
                  placeholder="e.g., Cake, Rent, Land"
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={goodDescription}
                  onChange={(e) => setGoodDescription(e.target.value)}
                  placeholder="e.g., Birthday cake to split"
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <h3 className="font-medium text-blue-800 text-sm mb-2">How {mechanism?.name} works</h3>
            <p className="text-xs text-blue-700">{mechanism?.howItWorks}</p>
          </div>

          {/* Tips */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <h3 className="font-medium text-slate-800 text-sm mb-2">About this version</h3>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>This implementation assumes uniform valuations (everyone values the whole item equally).</li>
              <li>For more complex scenarios with different preferences, advanced mechanisms would be needed.</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          {/* Participants */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-800">Participants</h2>
              {canAddAgent && (
                <button
                  onClick={addAgent}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Add Participant
                </button>
              )}
            </div>

            {requiresTwoAgents && (
              <p className="text-sm text-amber-600 bg-amber-50 rounded px-3 py-2 mb-3">
                {mechanism?.name} requires exactly 2 participants.
              </p>
            )}

            <div className="space-y-3">
              {agents.map((agent, index) => (
                <div key={agent.id} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                  <span className="text-sm font-medium text-slate-500 w-8">#{index + 1}</span>
                  <input
                    type="text"
                    value={agent.name}
                    onChange={(e) => updateAgentName(agent.id, e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
                    placeholder="Participant name"
                  />
                  {canRemoveAgent && (
                    <button
                      onClick={() => removeAgent(agent.id)}
                      className="text-red-500 hover:text-red-600 p-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {canAddAgent && (
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addAgent()}
                  placeholder="New participant name"
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-blue-400"
                />
                <button
                  onClick={addAgent}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-sm hover:bg-slate-200"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Role assignment for Cut-and-Choose */}
          {selectedMechanism === 'cut-and-choose' && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
              <h2 className="font-semibold text-slate-800 mb-3">Assign Roles</h2>
              <p className="text-sm text-slate-600 mb-3">
                In Cut-and-Choose, one person cuts and the other chooses. Who should be the cutter?
              </p>
              <div className="space-y-2">
                {agents.map((agent) => (
                  <label
                    key={agent.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      cutterAgentId === agent.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cutter"
                      value={agent.id}
                      checked={cutterAgentId === agent.id}
                      onChange={(e) => setCutterAgentId(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-slate-800">{agent.name}</span>
                      <span className="text-sm text-slate-500 ml-2">
                        {cutterAgentId === agent.id ? '(Cutter)' : '(Chooser)'}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Tip: The cutter is guaranteed exactly 50% (their perceived fair share), while the
                chooser gets at least 50% (and possibly more if they value the pieces differently).
              </p>
            </div>
          )}

          {/* Preview */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-800 mb-3">Division Preview</h2>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-8 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 rounded relative">
                {agents.map((agent, index) => {
                  const width = 100 / agents.length;
                  const left = index * width;
                  return (
                    <div
                      key={agent.id}
                      className="absolute top-0 bottom-0 flex items-center justify-center text-xs font-medium text-blue-800"
                      style={{ left: `${left}%`, width: `${width}%` }}
                    >
                      {agent.name}
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              The {goodName} will be divided equally among {agents.length} participant{agents.length !== 1 ? 's' : ''}.
              Each person will receive {(100 / agents.length).toFixed(1)}%.
            </p>
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
          disabled={!goodName.trim() || agents.length < 2}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          Calculate Division
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import type { DivisibleAllocationProblem, DivisibleResource, AllocationAgent } from '../types';
import { allocationMechanisms, runAllocationMechanism } from '../lib/mechanisms/allocation';
import { generateUUID } from '../lib/utils/uuid';

export function AllocationInput() {
  const navigate = useNavigate();
  const { session, setProblem, setResult } = useSession();
  const { selectedMechanism } = session;

  const mechanism = allocationMechanisms.find((m) => m.id === selectedMechanism);

  const [resourceName, setResourceName] = useState('Bandwidth');
  const [totalAmount, setTotalAmount] = useState(100);
  const [unit, setUnit] = useState('Mbps');

  const [agents, setAgents] = useState<AllocationAgent[]>([
    { id: 'agent-1', name: 'User A', demand: 40, weight: 1 },
    { id: 'agent-2', name: 'User B', demand: 30, weight: 1 },
    { id: 'agent-3', name: 'User C', demand: 50, weight: 1 },
  ]);

  const [newAgentName, setNewAgentName] = useState('');

  const isWeightedMechanism = selectedMechanism === 'weighted-fair-queuing';

  const addAgent = () => {
    if (!newAgentName.trim()) return;
    const id = `agent-${generateUUID().slice(0, 8)}`;
    setAgents([...agents, { id, name: newAgentName.trim(), demand: 25, weight: 1 }]);
    setNewAgentName('');
  };

  const removeAgent = (agentId: string) => {
    if (agents.length <= 2) return;
    setAgents(agents.filter((a) => a.id !== agentId));
  };

  const updateAgent = (agentId: string, updates: Partial<AllocationAgent>) => {
    setAgents(agents.map((a) => (a.id === agentId ? { ...a, ...updates } : a)));
  };

  const handleCalculate = () => {
    if (!selectedMechanism) return;

    const resource: DivisibleResource = {
      id: 'resource-1',
      name: resourceName,
      totalAmount,
      unit,
    };

    const problem: DivisibleAllocationProblem = {
      resource,
      agents,
    };

    setProblem(problem);

    const result = runAllocationMechanism(selectedMechanism, problem);
    setResult(result);

    navigate('/results');
  };

  const handleBack = () => {
    navigate('/mechanism');
  };

  const totalDemand = agents.reduce((sum, a) => sum + a.demand, 0);
  const demandExceedsSupply = totalDemand > totalAmount;

  // Calculate preview allocations for visualization
  const getPreviewAllocations = () => {
    if (totalDemand === 0) return agents.map(() => 0);

    if (selectedMechanism === 'proportional-fairness') {
      if (totalDemand <= totalAmount) {
        return agents.map(a => (a.demand / totalAmount) * 100);
      }
      return agents.map(a => (a.demand / totalDemand) * 100);
    }

    if (selectedMechanism === 'weighted-fair-queuing') {
      const totalWeight = agents.reduce((sum, a) => sum + (a.weight ?? 1), 0);
      return agents.map(a => ((a.weight ?? 1) / totalWeight) * 100);
    }

    // Max-min fairness: equal share up to demand
    const equalShare = totalAmount / agents.length;
    return agents.map(a => {
      const share = Math.min(equalShare, a.demand);
      return (share / totalAmount) * 100;
    });
  };

  const previewAllocations = getPreviewAllocations();
  const agentColors = ['bg-purple-400', 'bg-blue-400', 'bg-green-400', 'bg-amber-400', 'bg-pink-400', 'bg-cyan-400'];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Set up the allocation</h1>
      <p className="text-slate-600 mb-6">
        Using <span className="font-medium">{mechanism?.name}</span>. Define the resource being
        shared and what each participant needs.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {/* Resource being allocated */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-800 mb-3">Resource Details</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Resource Name</label>
                <input
                  type="text"
                  value={resourceName}
                  onChange={(e) => setResourceName(e.target.value)}
                  placeholder="e.g., Bandwidth, Budget, CPU Time"
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:border-purple-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Total Amount</label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Math.max(1, Number(e.target.value)))}
                    min="1"
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g., Mbps, $, %"
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
            <h3 className="font-medium text-purple-800 text-sm mb-2">How {mechanism?.name} works</h3>
            <p className="text-xs text-purple-700">{mechanism?.howItWorks}</p>
          </div>

          {/* Demand status */}
          <div className={`rounded-lg border p-4 ${demandExceedsSupply ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
            <h3 className={`font-medium text-sm mb-2 ${demandExceedsSupply ? 'text-amber-800' : 'text-green-800'}`}>
              Demand Status
            </h3>
            <p className={`text-xs ${demandExceedsSupply ? 'text-amber-700' : 'text-green-700'}`}>
              Total demand: {totalDemand} {unit}<br />
              Available: {totalAmount} {unit}<br />
              {demandExceedsSupply
                ? `Oversubscribed by ${totalDemand - totalAmount} ${unit} - allocation will be constrained.`
                : `${totalAmount - totalDemand} ${unit} of slack available.`}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          {/* Participants */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-800">Participants</h2>
              <button
                onClick={addAgent}
                disabled={!newAgentName.trim()}
                className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Add Participant
              </button>
            </div>

            <div className="space-y-3">
              {agents.map((agent, index) => (
                <div key={agent.id} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${agentColors[index % agentColors.length]}`} />
                    <input
                      type="text"
                      value={agent.name}
                      onChange={(e) => updateAgent(agent.id, { name: e.target.value })}
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-purple-400"
                      placeholder="Participant name"
                    />
                    {agents.length > 2 && (
                      <button
                        onClick={() => removeAgent(agent.id)}
                        className="text-red-500 hover:text-red-600 p-1 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">Demand ({unit})</label>
                      <input
                        type="number"
                        value={agent.demand}
                        onChange={(e) => updateAgent(agent.id, { demand: Math.max(0, Number(e.target.value)) })}
                        min="0"
                        className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    {isWeightedMechanism && (
                      <div className="w-24">
                        <label className="block text-xs text-slate-500 mb-1">Weight</label>
                        <input
                          type="number"
                          value={agent.weight ?? 1}
                          onChange={(e) => updateAgent(agent.id, { weight: Math.max(0.1, Number(e.target.value)) })}
                          min="0.1"
                          step="0.1"
                          className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-purple-400"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAgent()}
                placeholder="New participant name"
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-purple-400"
              />
              <button
                onClick={addAgent}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-sm hover:bg-slate-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-800 mb-3">Allocation Preview</h2>

            {/* Demand bars */}
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2">Demand vs Available</p>
              <div className="h-8 bg-slate-200 rounded relative overflow-hidden">
                {agents.map((agent, index) => {
                  const startPercent = agents.slice(0, index).reduce((sum, a) => sum + (a.demand / Math.max(totalDemand, totalAmount)) * 100, 0);
                  const widthPercent = (agent.demand / Math.max(totalDemand, totalAmount)) * 100;
                  return (
                    <div
                      key={agent.id}
                      className={`absolute top-0 bottom-0 ${agentColors[index % agentColors.length]} flex items-center justify-center text-xs text-white font-medium overflow-hidden`}
                      style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
                    >
                      {widthPercent > 8 && agent.name}
                    </div>
                  );
                })}
                {!demandExceedsSupply && (
                  <div
                    className="absolute top-0 bottom-0 bg-slate-300 opacity-50"
                    style={{ left: `${(totalDemand / totalAmount) * 100}%`, right: 0 }}
                  />
                )}
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0 {unit}</span>
                <span>{Math.max(totalDemand, totalAmount)} {unit}</span>
              </div>
            </div>

            {/* Estimated allocation */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Estimated Allocation</p>
              <div className="h-8 bg-slate-200 rounded relative overflow-hidden">
                {agents.map((agent, index) => {
                  const startPercent = previewAllocations.slice(0, index).reduce((sum, p) => sum + p, 0);
                  return (
                    <div
                      key={agent.id}
                      className={`absolute top-0 bottom-0 ${agentColors[index % agentColors.length]} flex items-center justify-center text-xs text-white font-medium overflow-hidden`}
                      style={{ left: `${startPercent}%`, width: `${previewAllocations[index]}%` }}
                    >
                      {previewAllocations[index] > 8 && `${previewAllocations[index].toFixed(1)}%`}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-3">
              {demandExceedsSupply
                ? `With demand exceeding supply, ${mechanism?.name} will determine how to fairly allocate the ${totalAmount} ${unit}.`
                : `All demands can be satisfied. Each participant will receive their requested amount.`}
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
          disabled={!resourceName.trim() || agents.length < 2 || totalAmount <= 0}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          Calculate Allocation
        </button>
      </div>
    </div>
  );
}

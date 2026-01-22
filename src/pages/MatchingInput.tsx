import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import type { MatchingProblem, MatchingAgent, MatchingType } from '../types';
import { matchingMechanisms, runMatchingMechanism } from '../lib/mechanisms/matching';
import { generateUUID } from '../lib/utils/uuid';

type ScenarioType = 'chore-assignment' | 'job-matching' | 'school-choice';

interface ScenarioConfig {
  id: ScenarioType;
  name: string;
  description: string;
  matchingType: MatchingType;
  sideALabel: string;
  sideBLabel: string;
  defaultSideA: { name: string }[];
  defaultSideB: { name: string; capacity?: number }[];
  twoSidedPreferences: boolean;
}

const scenarios: ScenarioConfig[] = [
  {
    id: 'chore-assignment',
    name: 'Chore Assignment',
    description: 'Assign people to chores based on their preferences',
    matchingType: 'assignment',
    sideALabel: 'People',
    sideBLabel: 'Chores',
    defaultSideA: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Carol' }],
    defaultSideB: [{ name: 'Dishes' }, { name: 'Vacuuming' }, { name: 'Laundry' }],
    twoSidedPreferences: false,
  },
  {
    id: 'job-matching',
    name: 'Job Matching',
    description: 'Match job applicants to positions (both sides have preferences)',
    matchingType: 'one-to-one',
    sideALabel: 'Applicants',
    sideBLabel: 'Jobs',
    defaultSideA: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Carol' }],
    defaultSideB: [{ name: 'Engineering' }, { name: 'Marketing' }, { name: 'Design' }],
    twoSidedPreferences: true,
  },
  {
    id: 'school-choice',
    name: 'School Choice',
    description: 'Match students to schools with limited capacity',
    matchingType: 'many-to-one',
    sideALabel: 'Students',
    sideBLabel: 'Schools',
    defaultSideA: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Carol' }, { name: 'David' }],
    defaultSideB: [{ name: 'Lincoln High', capacity: 2 }, { name: 'Washington High', capacity: 2 }],
    twoSidedPreferences: true,
  },
];

export function MatchingInput() {
  const navigate = useNavigate();
  const { session, setProblem, setResult } = useSession();
  const { selectedMechanism } = session;

  const mechanism = matchingMechanisms.find((m) => m.id === selectedMechanism);

  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('chore-assignment');
  const scenario = scenarios.find((s) => s.id === selectedScenario)!;

  const [agentsSideA, setAgentsSideA] = useState<MatchingAgent[]>(
    scenario.defaultSideA.map((a) => ({
      id: `a-${generateUUID().slice(0, 8)}`,
      name: a.name,
      side: 'A' as const,
    }))
  );

  const [agentsSideB, setAgentsSideB] = useState<MatchingAgent[]>(
    scenario.defaultSideB.map((b) => ({
      id: `b-${generateUUID().slice(0, 8)}`,
      name: b.name,
      side: 'B' as const,
      capacity: b.capacity,
    }))
  );

  // Preferences: agentId -> ranked list of ids from other side
  const [preferencesSideA, setPreferencesSideA] = useState<Record<string, string[]>>(() => {
    const prefs: Record<string, string[]> = {};
    agentsSideA.forEach((a) => {
      prefs[a.id] = agentsSideB.map((b) => b.id);
    });
    return prefs;
  });

  const [preferencesSideB, setPreferencesSideB] = useState<Record<string, string[]>>(() => {
    const prefs: Record<string, string[]> = {};
    agentsSideB.forEach((b) => {
      prefs[b.id] = agentsSideA.map((a) => a.id);
    });
    return prefs;
  });

  const [newAgentNameA, setNewAgentNameA] = useState('');
  const [newAgentNameB, setNewAgentNameB] = useState('');

  const handleScenarioChange = (newScenario: ScenarioType) => {
    setSelectedScenario(newScenario);
    const config = scenarios.find((s) => s.id === newScenario)!;

    const newSideA = config.defaultSideA.map((a) => ({
      id: `a-${generateUUID().slice(0, 8)}`,
      name: a.name,
      side: 'A' as const,
    }));

    const newSideB = config.defaultSideB.map((b) => ({
      id: `b-${generateUUID().slice(0, 8)}`,
      name: b.name,
      side: 'B' as const,
      capacity: b.capacity,
    }));

    setAgentsSideA(newSideA);
    setAgentsSideB(newSideB);

    // Reset preferences
    const prefsA: Record<string, string[]> = {};
    newSideA.forEach((a) => {
      prefsA[a.id] = newSideB.map((b) => b.id);
    });
    setPreferencesSideA(prefsA);

    const prefsB: Record<string, string[]> = {};
    newSideB.forEach((b) => {
      prefsB[b.id] = newSideA.map((a) => a.id);
    });
    setPreferencesSideB(prefsB);
  };

  const addAgentSideA = () => {
    if (!newAgentNameA.trim()) return;
    const id = `a-${generateUUID().slice(0, 8)}`;
    const newAgent: MatchingAgent = { id, name: newAgentNameA.trim(), side: 'A' };
    setAgentsSideA([...agentsSideA, newAgent]);
    setPreferencesSideA({
      ...preferencesSideA,
      [id]: agentsSideB.map((b) => b.id),
    });
    // Update Side B preferences to include new agent
    const updatedPrefsB: Record<string, string[]> = {};
    agentsSideB.forEach((b) => {
      updatedPrefsB[b.id] = [...(preferencesSideB[b.id] || []), id];
    });
    setPreferencesSideB(updatedPrefsB);
    setNewAgentNameA('');
  };

  const addAgentSideB = () => {
    if (!newAgentNameB.trim()) return;
    const id = `b-${generateUUID().slice(0, 8)}`;
    const newAgent: MatchingAgent = {
      id,
      name: newAgentNameB.trim(),
      side: 'B',
      capacity: scenario.matchingType === 'many-to-one' ? 1 : undefined,
    };
    setAgentsSideB([...agentsSideB, newAgent]);
    setPreferencesSideB({
      ...preferencesSideB,
      [id]: agentsSideA.map((a) => a.id),
    });
    // Update Side A preferences to include new item
    const updatedPrefsA: Record<string, string[]> = {};
    agentsSideA.forEach((a) => {
      updatedPrefsA[a.id] = [...(preferencesSideA[a.id] || []), id];
    });
    setPreferencesSideA(updatedPrefsA);
    setNewAgentNameB('');
  };

  const removeAgentSideA = (agentId: string) => {
    if (agentsSideA.length <= 2) return;
    setAgentsSideA(agentsSideA.filter((a) => a.id !== agentId));
    const newPrefsA = { ...preferencesSideA };
    delete newPrefsA[agentId];
    setPreferencesSideA(newPrefsA);
    // Remove from Side B preferences
    const newPrefsB: Record<string, string[]> = {};
    Object.entries(preferencesSideB).forEach(([bId, prefs]) => {
      newPrefsB[bId] = prefs.filter((id) => id !== agentId);
    });
    setPreferencesSideB(newPrefsB);
  };

  const removeAgentSideB = (agentId: string) => {
    if (agentsSideB.length <= 2) return;
    setAgentsSideB(agentsSideB.filter((b) => b.id !== agentId));
    const newPrefsB = { ...preferencesSideB };
    delete newPrefsB[agentId];
    setPreferencesSideB(newPrefsB);
    // Remove from Side A preferences
    const newPrefsA: Record<string, string[]> = {};
    Object.entries(preferencesSideA).forEach(([aId, prefs]) => {
      newPrefsA[aId] = prefs.filter((id) => id !== agentId);
    });
    setPreferencesSideA(newPrefsA);
  };

  const updateAgentNameA = (agentId: string, name: string) => {
    setAgentsSideA(agentsSideA.map((a) => (a.id === agentId ? { ...a, name } : a)));
  };

  const updateAgentNameB = (agentId: string, name: string) => {
    setAgentsSideB(agentsSideB.map((b) => (b.id === agentId ? { ...b, name } : b)));
  };

  const updateCapacity = (agentId: string, capacity: number) => {
    setAgentsSideB(agentsSideB.map((b) => (b.id === agentId ? { ...b, capacity } : b)));
  };

  const movePreference = (
    side: 'A' | 'B',
    agentId: string,
    prefId: string,
    direction: 'up' | 'down'
  ) => {
    const prefs = side === 'A' ? preferencesSideA : preferencesSideB;
    const setPrefs = side === 'A' ? setPreferencesSideA : setPreferencesSideB;

    const currentPrefs = [...(prefs[agentId] || [])];
    const index = currentPrefs.indexOf(prefId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      [currentPrefs[index - 1], currentPrefs[index]] = [currentPrefs[index], currentPrefs[index - 1]];
    } else if (direction === 'down' && index < currentPrefs.length - 1) {
      [currentPrefs[index], currentPrefs[index + 1]] = [currentPrefs[index + 1], currentPrefs[index]];
    }

    setPrefs({ ...prefs, [agentId]: currentPrefs });
  };

  const handleCalculate = () => {
    if (!selectedMechanism) return;

    const problem: MatchingProblem = {
      type: scenario.matchingType,
      agentsSideA,
      agentsSideB,
      preferencesSideA,
      preferencesSideB: scenario.twoSidedPreferences ? preferencesSideB : {},
    };

    setProblem(problem);

    const result = runMatchingMechanism(selectedMechanism, problem);
    setResult(result);

    navigate('/results');
  };

  const handleBack = () => {
    navigate('/mechanism');
  };

  const agentColorsA = ['bg-indigo-400', 'bg-blue-400', 'bg-cyan-400', 'bg-teal-400', 'bg-emerald-400'];
  const agentColorsB = ['bg-rose-400', 'bg-pink-400', 'bg-fuchsia-400', 'bg-purple-400', 'bg-violet-400'];

  const getAgentNameA = (id: string) => agentsSideA.find((a) => a.id === id)?.name || id;
  const getAgentNameB = (id: string) => agentsSideB.find((b) => b.id === id)?.name || id;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Set up the matching</h1>
      <p className="text-slate-600 mb-6">
        Using <span className="font-medium">{mechanism?.name}</span>. Define who is being matched
        and their preferences.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {/* Scenario selector */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-800 mb-3">Scenario Type</h2>
            <div className="space-y-2">
              {scenarios.map((s) => (
                <label
                  key={s.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedScenario === s.id
                      ? 'bg-indigo-50 border-indigo-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="scenario"
                    checked={selectedScenario === s.id}
                    onChange={() => handleScenarioChange(s.id)}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-medium text-slate-800">{s.name}</span>
                    <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-4">
            <h3 className="font-medium text-indigo-800 text-sm mb-2">How {mechanism?.name} works</h3>
            <p className="text-xs text-indigo-700">{mechanism?.howItWorks}</p>
          </div>

          {/* Real-world examples */}
          {mechanism?.realWorldExamples && (
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
              <h3 className="font-medium text-slate-800 text-sm mb-2">Real-world uses</h3>
              <ul className="text-xs text-slate-600 space-y-1">
                {mechanism.realWorldExamples.map((ex, i) => (
                  <li key={i}>* {ex}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Side A: People/Applicants/Students */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-800">{scenario.sideALabel}</h2>
              <span className="text-sm text-slate-500">{agentsSideA.length} participants</span>
            </div>

            <div className="space-y-3">
              {agentsSideA.map((agent, index) => (
                <div key={agent.id} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${agentColorsA[index % agentColorsA.length]}`} />
                    <input
                      type="text"
                      value={agent.name}
                      onChange={(e) => updateAgentNameA(agent.id, e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-indigo-400"
                      placeholder="Name"
                    />
                    {agentsSideA.length > 2 && (
                      <button
                        onClick={() => removeAgentSideA(agent.id)}
                        className="text-red-500 hover:text-red-600 p-1 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Preferences */}
                  <div className="ml-6">
                    <p className="text-xs text-slate-500 mb-1">Preferences (best to worst):</p>
                    <div className="flex flex-wrap gap-1">
                      {(preferencesSideA[agent.id] || []).map((prefId, prefIndex) => (
                        <div
                          key={prefId}
                          className="flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                        >
                          <span className="text-slate-400 mr-1">{prefIndex + 1}.</span>
                          <span>{getAgentNameB(prefId)}</span>
                          <div className="flex gap-0.5 ml-1">
                            <button
                              onClick={() => movePreference('A', agent.id, prefId, 'up')}
                              disabled={prefIndex === 0}
                              className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                            >
                              <span className="text-[10px]">-</span>
                            </button>
                            <button
                              onClick={() => movePreference('A', agent.id, prefId, 'down')}
                              disabled={prefIndex === (preferencesSideA[agent.id]?.length || 0) - 1}
                              className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                            >
                              <span className="text-[10px]">+</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={newAgentNameA}
                onChange={(e) => setNewAgentNameA(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAgentSideA()}
                placeholder={`Add ${scenario.sideALabel.toLowerCase().slice(0, -1)}`}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-indigo-400"
              />
              <button
                onClick={addAgentSideA}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Side B: Chores/Jobs/Schools */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-800">{scenario.sideBLabel}</h2>
              <span className="text-sm text-slate-500">{agentsSideB.length} options</span>
            </div>

            <div className="space-y-3">
              {agentsSideB.map((agent, index) => (
                <div key={agent.id} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${agentColorsB[index % agentColorsB.length]}`} />
                    <input
                      type="text"
                      value={agent.name}
                      onChange={(e) => updateAgentNameB(agent.id, e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-indigo-400"
                      placeholder="Name"
                    />
                    {scenario.matchingType === 'many-to-one' && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-500">Capacity:</label>
                        <input
                          type="number"
                          value={agent.capacity || 1}
                          onChange={(e) => updateCapacity(agent.id, Math.max(1, Number(e.target.value)))}
                          min="1"
                          className="w-16 px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                    )}
                    {agentsSideB.length > 2 && (
                      <button
                        onClick={() => removeAgentSideB(agent.id)}
                        className="text-red-500 hover:text-red-600 p-1 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Preferences (only for two-sided matching) */}
                  {scenario.twoSidedPreferences && (
                    <div className="ml-6">
                      <p className="text-xs text-slate-500 mb-1">Preferences (best to worst):</p>
                      <div className="flex flex-wrap gap-1">
                        {(preferencesSideB[agent.id] || []).map((prefId, prefIndex) => (
                          <div
                            key={prefId}
                            className="flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                          >
                            <span className="text-slate-400 mr-1">{prefIndex + 1}.</span>
                            <span>{getAgentNameA(prefId)}</span>
                            <div className="flex gap-0.5 ml-1">
                              <button
                                onClick={() => movePreference('B', agent.id, prefId, 'up')}
                                disabled={prefIndex === 0}
                                className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                              >
                                <span className="text-[10px]">-</span>
                              </button>
                              <button
                                onClick={() => movePreference('B', agent.id, prefId, 'down')}
                                disabled={prefIndex === (preferencesSideB[agent.id]?.length || 0) - 1}
                                className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                              >
                                <span className="text-[10px]">+</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={newAgentNameB}
                onChange={(e) => setNewAgentNameB(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAgentSideB()}
                placeholder={`Add ${scenario.sideBLabel.toLowerCase().slice(0, -1)}`}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-indigo-400"
              />
              <button
                onClick={addAgentSideB}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-800 mb-3">Matching Preview</h2>
            <p className="text-sm text-slate-600 mb-3">
              {agentsSideA.length} {scenario.sideALabel.toLowerCase()} will be matched with{' '}
              {agentsSideB.length} {scenario.sideBLabel.toLowerCase()}.
              {scenario.twoSidedPreferences
                ? ' Both sides have preferences that will be considered.'
                : ' Only one side has preferences.'}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">{scenario.sideALabel}</p>
                <div className="flex flex-wrap gap-2">
                  {agentsSideA.map((a, i) => (
                    <span
                      key={a.id}
                      className={`px-2 py-1 rounded text-xs text-white ${agentColorsA[i % agentColorsA.length]}`}
                    >
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">{scenario.sideBLabel}</p>
                <div className="flex flex-wrap gap-2">
                  {agentsSideB.map((b, i) => (
                    <span
                      key={b.id}
                      className={`px-2 py-1 rounded text-xs text-white ${agentColorsB[i % agentColorsB.length]}`}
                    >
                      {b.name}
                      {b.capacity && b.capacity > 1 && ` (${b.capacity})`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
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
          disabled={agentsSideA.length < 2 || agentsSideB.length < 2}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          Calculate Matching
        </button>
      </div>
    </div>
  );
}

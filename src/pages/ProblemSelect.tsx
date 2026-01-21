import { useNavigate } from 'react-router-dom';
import type { ProblemDefinition, ProblemType } from '../types';
import { useSession } from '../hooks/useSession';

const problems: ProblemDefinition[] = [
  {
    id: 'voting',
    name: 'Voting',
    description:
      'Choose a winner from a set of candidates based on voter preferences. Examples: electing a leader, selecting a project, choosing a restaurant.',
    icon: '🗳️',
  },
  {
    id: 'allocation',
    name: 'Resource Allocation',
    description:
      'Divide resources among participants fairly. Examples: splitting costs, dividing inheritance, allocating budget.',
    icon: '📊',
  },
  {
    id: 'fair-division',
    name: 'Fair Division',
    description:
      'Divide goods among people with different preferences. Examples: splitting rent, dividing household chores, cake cutting.',
    icon: '🍰',
  },
  {
    id: 'matching',
    name: 'Matching',
    description:
      'Match agents to each other or to resources. Examples: roommate matching, job assignments, school choice.',
    icon: '🔗',
  },
];

export function ProblemSelect() {
  const navigate = useNavigate();
  const { setProblemType } = useSession();

  const handleSelect = (problemType: ProblemType) => {
    setProblemType(problemType);
    navigate('/axioms');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">
        What type of decision are you making?
      </h1>
      <p className="text-slate-600 mb-6">
        Select the category that best describes your decision problem.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {problems.map((problem) => (
          <button
            key={problem.id}
            onClick={() => handleSelect(problem.id)}
            disabled={problem.id !== 'voting'}
            className={`text-left p-4 rounded-lg border transition-all ${
              problem.id === 'voting'
                ? 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer'
                : 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{problem.icon}</span>
              <div>
                <h3 className="font-semibold text-slate-800">
                  {problem.name}
                  {problem.id !== 'voting' && (
                    <span className="ml-2 text-xs bg-slate-200 text-slate-500 px-2 py-0.5 rounded">
                      Coming soon
                    </span>
                  )}
                </h3>
                <p className="text-sm text-slate-600 mt-1">{problem.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

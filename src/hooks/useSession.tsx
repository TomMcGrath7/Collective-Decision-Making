import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  DecisionSession,
  ProblemType,
  VotingProblem,
  AllocationProblem,
  VotingResult,
  AllocationResult,
} from '../types';

interface SessionContextValue {
  session: DecisionSession;
  setProblemType: (type: ProblemType) => void;
  toggleAxiom: (axiomId: string) => void;
  setSelectedAxioms: (axioms: string[]) => void;
  setMechanism: (mechanismId: string) => void;
  setProblem: (problem: VotingProblem | AllocationProblem) => void;
  setResult: (result: VotingResult | AllocationResult) => void;
  resetSession: () => void;
}

const createInitialSession = (): DecisionSession => ({
  id: crypto.randomUUID(),
  problemType: 'voting',
  selectedAxioms: [],
  selectedMechanism: null,
  problem: null,
  result: null,
  startedAt: Date.now(),
});

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DecisionSession>(createInitialSession);

  const setProblemType = useCallback((type: ProblemType) => {
    setSession((prev) => ({
      ...prev,
      problemType: type,
      selectedAxioms: [],
      selectedMechanism: null,
      problem: null,
      result: null,
    }));
  }, []);

  const toggleAxiom = useCallback((axiomId: string) => {
    setSession((prev) => ({
      ...prev,
      selectedAxioms: prev.selectedAxioms.includes(axiomId)
        ? prev.selectedAxioms.filter((a) => a !== axiomId)
        : [...prev.selectedAxioms, axiomId],
      selectedMechanism: null,
      result: null,
    }));
  }, []);

  const setSelectedAxioms = useCallback((axioms: string[]) => {
    setSession((prev) => ({
      ...prev,
      selectedAxioms: axioms,
      selectedMechanism: null,
      result: null,
    }));
  }, []);

  const setMechanism = useCallback((mechanismId: string) => {
    setSession((prev) => ({
      ...prev,
      selectedMechanism: mechanismId,
      result: null,
    }));
  }, []);

  const setProblem = useCallback((problem: VotingProblem | AllocationProblem) => {
    setSession((prev) => ({
      ...prev,
      problem,
      result: null,
    }));
  }, []);

  const setResult = useCallback((result: VotingResult | AllocationResult) => {
    setSession((prev) => ({
      ...prev,
      result,
    }));
  }, []);

  const resetSession = useCallback(() => {
    setSession(createInitialSession());
  }, []);

  return (
    <SessionContext.Provider
      value={{
        session,
        setProblemType,
        toggleAxiom,
        setSelectedAxioms,
        setMechanism,
        setProblem,
        setResult,
        resetSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { SessionProvider } from './hooks/useSession';
import {
  Home,
  ProblemSelect,
  AxiomSelect,
  MechanismSelect,
  VotingInput,
  FairDivisionInput,
  AllocationInput,
  MatchingInput,
  Results,
  LearnMore,
} from './pages';
import { initAnalytics, trackSessionStart } from './lib/analytics';

function App() {
  useEffect(() => {
    initAnalytics();
    trackSessionStart();
  }, []);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SessionProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="problem" element={<ProblemSelect />} />
            <Route path="axioms" element={<AxiomSelect />} />
            <Route path="mechanism" element={<MechanismSelect />} />
            <Route path="input" element={<VotingInput />} />
            <Route path="fair-division-input" element={<FairDivisionInput />} />
            <Route path="allocation-input" element={<AllocationInput />} />
            <Route path="matching-input" element={<MatchingInput />} />
            <Route path="results" element={<Results />} />
            <Route path="learn" element={<LearnMore />} />
          </Route>
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;

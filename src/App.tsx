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
    <BrowserRouter>
      <SessionProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="problem" element={<ProblemSelect />} />
            <Route path="axioms" element={<AxiomSelect />} />
            <Route path="mechanism" element={<MechanismSelect />} />
            <Route path="input" element={<VotingInput />} />
            <Route path="results" element={<Results />} />
            <Route path="learn" element={<LearnMore />} />
          </Route>
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;

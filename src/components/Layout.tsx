import { Outlet, Link, useLocation } from 'react-router-dom';
import { ConsentBanner } from './ConsentBanner';

const steps = [
  { path: '/', label: 'Home', step: 0 },
  { path: '/problem', label: 'Problem', step: 1 },
  { path: '/axioms', label: 'Axioms', step: 2 },
  { path: '/mechanism', label: 'Mechanism', step: 3 },
  { path: '/input', label: 'Input', step: 4 },
  { path: '/results', label: 'Results', step: 5 },
];

export function Layout() {
  const location = useLocation();
  const currentStep = steps.find((s) => s.path === location.pathname)?.step ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link to="/" className="text-xl font-semibold text-slate-800">
            Collective Decision Making
          </Link>
          <p className="text-sm text-slate-500">
            Fair decisions through cooperative game theory
          </p>
        </div>
      </header>

      {currentStep > 0 && (
        <nav className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              {steps.slice(1).map((step, idx) => (
                <div key={step.path} className="flex items-center">
                  {idx > 0 && <span className="mx-2 text-slate-300">→</span>}
                  <span
                    className={`px-2 py-1 rounded ${
                      currentStep === step.step
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : currentStep > step.step
                          ? 'text-slate-600'
                          : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </nav>
      )}

      <main className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500">
              An educational tool for exploring fair decision mechanisms
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link to="/learn" className="text-blue-600 hover:text-blue-700">
                Learn More
              </Link>
              <a
                href="https://github.com/example/collective-decision-making"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-700"
              >
                GitHub
              </a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
            <p>
              This tool is for educational purposes only. All calculations run entirely in your browser.
              No voting data is collected or transmitted.
            </p>
          </div>
        </div>
      </footer>

      <ConsentBanner />
    </div>
  );
}

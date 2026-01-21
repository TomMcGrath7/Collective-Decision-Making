import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-slate-800 mb-4">
        Make Fair Decisions Together
      </h1>

      <p className="text-lg text-slate-600 mb-8">
        This tool helps groups make decisions using mathematically fair mechanisms from
        cooperative game theory. Select the fairness properties that matter to your group,
        and discover which decision rules satisfy them.
      </p>

      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 text-left">
        <h2 className="font-semibold text-slate-800 mb-3">How it works:</h2>
        <ol className="list-decimal list-inside space-y-2 text-slate-600">
          <li>Choose a problem type (voting, allocation, fair division)</li>
          <li>Select the fairness axioms your group cares about</li>
          <li>See which mechanisms satisfy those properties</li>
          <li>Enter everyone's preferences</li>
          <li>Get the fair outcome with a full explanation</li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/problem"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Get Started
        </Link>
        <Link
          to="/learn"
          className="inline-block text-blue-600 hover:text-blue-700 px-6 py-3 font-medium"
        >
          Learn About Voting Theory
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-800 mb-2">Educational</h3>
          <p className="text-sm text-slate-600">
            Learn about fairness axioms and social choice theory as you use the tool.
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-800 mb-2">Private</h3>
          <p className="text-sm text-slate-600">
            All calculations happen locally on your device. No data leaves your browser.
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-800 mb-2">Transparent</h3>
          <p className="text-sm text-slate-600">
            Every result includes a step-by-step explanation of how it was calculated.
          </p>
        </div>
      </div>
    </div>
  );
}

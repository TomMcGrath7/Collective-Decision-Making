import { Link } from 'react-router-dom';

export function LearnMore() {
  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/"
        className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-block"
      >
        ← Back to Home
      </Link>

      <h1 className="text-3xl font-bold text-slate-800 mb-6">
        Understanding Voting Theory
      </h1>

      <p className="text-lg text-slate-600 mb-8">
        Why is it so hard to design a "perfect" voting system? Mathematics tells us
        it's actually impossible. Here's why.
      </p>

      {/* Arrow's Impossibility Theorem */}
      <section className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">
          Arrow's Impossibility Theorem (1951)
        </h2>
        <p className="text-slate-600 mb-4">
          Kenneth Arrow proved that no ranked voting system with three or more
          candidates can simultaneously satisfy all of these reasonable-sounding
          criteria:
        </p>

        <div className="space-y-3 mb-4">
          <div className="bg-slate-50 p-3 rounded">
            <h3 className="font-medium text-slate-800">1. Non-Dictatorship</h3>
            <p className="text-sm text-slate-600">
              No single voter should be able to determine the outcome regardless of
              others' preferences.
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded">
            <h3 className="font-medium text-slate-800">2. Pareto Efficiency</h3>
            <p className="text-sm text-slate-600">
              If everyone prefers A to B, then the group should prefer A to B.
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded">
            <h3 className="font-medium text-slate-800">
              3. Independence of Irrelevant Alternatives (IIA)
            </h3>
            <p className="text-sm text-slate-600">
              The relative ranking of A and B should depend only on how voters rank A
              vs B, not on how they feel about candidate C.
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded">
            <h3 className="font-medium text-slate-800">4. Unrestricted Domain</h3>
            <p className="text-sm text-slate-600">
              The system should work for any possible set of voter preferences.
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <h3 className="font-medium text-amber-800 mb-2">A Simple Example</h3>
          <p className="text-sm text-amber-700 mb-2">
            Imagine three voters ranking candidates A, B, C:
          </p>
          <ul className="text-sm text-amber-700 list-disc list-inside mb-2">
            <li>Voter 1: A {'>'} B {'>'} C</li>
            <li>Voter 2: B {'>'} C {'>'} A</li>
            <li>Voter 3: C {'>'} A {'>'} B</li>
          </ul>
          <p className="text-sm text-amber-700">
            Pairwise: A beats B (voters 1,3), B beats C (voters 1,2), but C beats A
            (voters 2,3). The group has cyclic preferences even though each
            individual is perfectly rational!
          </p>
        </div>
      </section>

      {/* Gibbard-Satterthwaite Theorem */}
      <section className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">
          Gibbard-Satterthwaite Theorem (1973)
        </h2>
        <p className="text-slate-600 mb-4">
          Allan Gibbard and Mark Satterthwaite independently proved that for any
          voting system with three or more candidates:
        </p>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
          <p className="text-blue-800 font-medium">
            Either the system is dictatorial, OR it's possible for a voter to get a
            better outcome by voting strategically (dishonestly) rather than sincerely.
          </p>
        </div>

        <p className="text-slate-600 mb-4">
          This means <strong>strategic voting is unavoidable</strong> in any
          reasonable voting system. The question isn't whether voters can manipulate
          the system, but how easy or difficult manipulation is.
        </p>

        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="font-medium text-slate-800 mb-2">Practical Implications</h3>
          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
            <li>
              In plurality voting, you might vote for a "lesser evil" instead of your
              true favorite
            </li>
            <li>
              In Borda count, you might rank your second choice last to help your
              favorite win
            </li>
            <li>
              In approval voting, choosing your approval threshold is itself a
              strategic decision
            </li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-slate-800 mb-1">
              Why can't we have a perfect voting system?
            </h3>
            <p className="text-sm text-slate-600">
              Arrow's theorem proves it's mathematically impossible to satisfy all
              desirable properties simultaneously. Every voting system involves
              trade-offs. The best we can do is choose which properties matter most
              for our specific situation.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-slate-800 mb-1">
              Which voting system is best?
            </h3>
            <p className="text-sm text-slate-600">
              There's no universal answer. It depends on what you value: Do you want
              to find consensus (Borda)? Respect majority will (IRV, Plurality)? Find
              the option that beats all others head-to-head (Condorcet)? Minimize
              strategic voting incentives (Approval)? Each has trade-offs.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-slate-800 mb-1">
              What about other voting systems like STAR or Quadratic Voting?
            </h3>
            <p className="text-sm text-slate-600">
              There are many voting systems beyond the classical ones shown here.
              STAR (Score Then Automatic Runoff), Range Voting, and Quadratic Voting
              each have interesting properties. However, they're all subject to the
              fundamental limitations described by Arrow and Gibbard-Satterthwaite.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-slate-800 mb-1">
              Why does IRV violate monotonicity?
            </h3>
            <p className="text-sm text-slate-600">
              In IRV, the order of eliminations matters. If you rank a candidate
              higher, it can change who gets eliminated in earlier rounds, which can
              paradoxically cause your favorite to be eliminated later. The 2009
              Burlington mayoral election is a real-world example of this.
            </p>
          </div>
        </div>
      </section>

      {/* Academic Resources */}
      <section className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Academic Resources
        </h2>

        <div className="space-y-3">
          <a
            href="https://plato.stanford.edu/entries/voting-methods/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-slate-50 rounded hover:bg-slate-100 transition-colors"
          >
            <h3 className="font-medium text-blue-600">
              Stanford Encyclopedia of Philosophy: Voting Methods
            </h3>
            <p className="text-sm text-slate-600">
              Comprehensive philosophical overview of voting theory and social choice
            </p>
          </a>

          <a
            href="https://plato.stanford.edu/entries/arrows-theorem/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-slate-50 rounded hover:bg-slate-100 transition-colors"
          >
            <h3 className="font-medium text-blue-600">
              Stanford Encyclopedia of Philosophy: Arrow's Theorem
            </h3>
            <p className="text-sm text-slate-600">
              Detailed explanation of the impossibility theorem and its implications
            </p>
          </a>

          <a
            href="https://pacuit.org/esslli-2012/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-slate-50 rounded hover:bg-slate-100 transition-colors"
          >
            <h3 className="font-medium text-blue-600">
              Eric Pacuit's Voting Theory Course Materials
            </h3>
            <p className="text-sm text-slate-600">
              University-level course materials on computational social choice
            </p>
          </a>

          <a
            href="https://electowiki.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-slate-50 rounded hover:bg-slate-100 transition-colors"
          >
            <h3 className="font-medium text-blue-600">Electowiki</h3>
            <p className="text-sm text-slate-600">
              Community-maintained wiki on electoral systems and voting methods
            </p>
          </a>
        </div>
      </section>

      {/* Key References */}
      <section className="bg-slate-50 rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Key Academic References
        </h2>
        <ul className="text-sm text-slate-600 space-y-2">
          <li>
            Arrow, K. J. (1951). <em>Social Choice and Individual Values</em>.
            Wiley.
          </li>
          <li>
            Gibbard, A. (1973). "Manipulation of voting schemes: a general result."
            <em>Econometrica</em>, 41(4), 587-601.
          </li>
          <li>
            Satterthwaite, M. A. (1975). "Strategy-proofness and Arrow's conditions."
            <em>Journal of Economic Theory</em>, 10(2), 187-217.
          </li>
          <li>
            Sen, A. K. (1970). <em>Collective Choice and Social Welfare</em>.
            Holden-Day.
          </li>
          <li>
            Moulin, H. (1988). <em>Axioms of Cooperative Decision Making</em>.
            Cambridge University Press.
          </li>
        </ul>
      </section>
    </div>
  );
}

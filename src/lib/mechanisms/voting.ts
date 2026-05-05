import type { Mechanism, VotingProblem, VotingResult } from '../../types';

export const votingMechanisms: Mechanism[] = [
  {
    id: 'plurality',
    name: 'Plurality (First-Past-the-Post)',
    description:
      'Each voter selects one candidate. The candidate with the most votes wins.',
    howItWorks:
      'Count first-place votes for each candidate. The candidate with the highest count wins. In case of a tie, all tied candidates are co-winners.',
    realWorldExamples: [
      'UK Parliament elections',
      'US Congressional elections',
      'Canadian federal elections',
      'Indian general elections',
    ],
    problemType: 'voting',
    satisfiedAxioms: [
      'majority',
      'monotonicity',
      'anonymity',
      'neutrality',
      'participation',
      'consistency',
    ],
  },
  {
    id: 'borda',
    name: 'Borda Count',
    description:
      'Voters rank all candidates. Points are awarded based on ranking position.',
    howItWorks:
      'With n candidates, a first-place ranking gives n-1 points, second place gives n-2 points, and so on. The candidate with the most total points wins.',
    realWorldExamples: [
      'Eurovision Song Contest',
      'AP College Football Poll',
      'Nauru parliamentary elections',
      'Slovenian ethnic minority elections',
    ],
    problemType: 'voting',
    satisfiedAxioms: [
      'pareto-efficiency',
      'condorcet-loser',
      'monotonicity',
      'anonymity',
      'neutrality',
      'participation',
      'consistency',
      'reversal-symmetry',
    ],
  },
  {
    id: 'irv',
    name: 'Instant Runoff Voting (IRV)',
    description:
      'Voters rank candidates. The candidate with fewest votes is eliminated each round until one has a majority.',
    howItWorks:
      'Count first-place votes. If no candidate has >50%, eliminate the candidate with the fewest votes and redistribute their votes to voters\' next choices. Repeat until a candidate has a majority.',
    realWorldExamples: [
      'Australian federal elections',
      'Irish presidential elections',
      'New York City elections',
      'San Francisco municipal elections',
      'Academy Awards (Oscars) Best Picture',
    ],
    problemType: 'voting',
    satisfiedAxioms: [
      'majority',
      'condorcet-loser',
      'pareto-efficiency',
      'anonymity',
      'neutrality',
    ],
  },
  {
    id: 'approval',
    name: 'Approval Voting',
    description:
      'Voters approve of any number of candidates. The candidate with the most approvals wins.',
    howItWorks:
      'Each voter marks all candidates they approve of. Count the approvals for each candidate. The candidate with the most approvals wins.',
    realWorldExamples: [
      'UN Secretary-General selection (straw polls)',
      'Mathematical Association of America elections',
      'American Statistical Association elections',
      'Fargo, North Dakota municipal elections',
      'St. Louis, Missouri primary elections',
    ],
    problemType: 'voting',
    satisfiedAxioms: [
      'pareto-efficiency',
      'monotonicity',
      'anonymity',
      'neutrality',
      'participation',
      'consistency',
    ],
  },
  {
    id: 'schulze',
    name: 'Schulze Method',
    description:
      'A Condorcet method that selects the winner using the strongest beatpath through pairwise contests.',
    howItWorks:
      'Build the pairwise preference matrix. For every pair (i, j), the strength of the strongest path from i to j is the maximum over all paths of the smallest pairwise margin along that path. A candidate i beats j in the Schulze sense if the strongest path from i to j is stronger than the path from j to i. The winner beats every other candidate this way.',
    realWorldExamples: [
      'Wikimedia Foundation Board elections',
      'Pirate Party internal elections (Germany, Sweden)',
      'Ubuntu Leadership Council elections',
      'Debian general resolutions (variant)',
      'Software in the Public Interest board elections',
    ],
    problemType: 'voting',
    satisfiedAxioms: [
      'condorcet-winner',
      'condorcet-loser',
      'majority',
      'pareto-efficiency',
      'monotonicity',
      'anonymity',
      'neutrality',
      'reversal-symmetry',
    ],
  },
  {
    id: 'condorcet',
    name: 'Condorcet Method (Copeland)',
    description:
      'Compares all pairs of candidates. The candidate who wins the most pairwise matchups wins.',
    howItWorks:
      'For each pair of candidates, determine which one is preferred by more voters. A candidate scores +1 for each pairwise win, -1 for each loss, 0 for ties. Highest total score wins.',
    realWorldExamples: [
      'Debian Project leader elections',
      'Wikimedia Foundation Board elections',
      'Ubuntu Technical Board elections',
      'Various academic committee decisions',
    ],
    problemType: 'voting',
    satisfiedAxioms: [
      'condorcet-winner',
      'condorcet-loser',
      'majority',
      'pareto-efficiency',
      'monotonicity',
      'anonymity',
      'neutrality',
    ],
  },
];

export function getMechanismById(id: string): Mechanism | undefined {
  return votingMechanisms.find((m) => m.id === id);
}

// Borda Count Implementation
export function bordaCount(problem: VotingProblem): VotingResult {
  const { candidates, voters } = problem;
  const n = candidates.length;
  const scores: Record<string, number> = {};

  candidates.forEach((c) => {
    scores[c.id] = 0;
  });

  voters.forEach((voter) => {
    voter.ranking.forEach((candidateId, index) => {
      scores[candidateId] += n - 1 - index;
    });
  });

  const maxScore = Math.max(...Object.values(scores));
  const winners = candidates.filter((c) => scores[c.id] === maxScore).map((c) => c.id);

  const candidateNames = Object.fromEntries(candidates.map((c) => [c.id, c.name]));
  const sortedCandidates = [...candidates].sort((a, b) => scores[b.id] - scores[a.id]);
  const scoreList = sortedCandidates
    .map((c) => `${c.name}: ${scores[c.id]} points`)
    .join(', ');

  const explanation =
    `With ${voters.length} voters and ${n} candidates, each first-place vote gives ${n - 1} points, ` +
    `second place gives ${n - 2} points, and so on.\n\n` +
    `Final scores: ${scoreList}\n\n` +
    (winners.length === 1
      ? `${candidateNames[winners[0]]} wins with ${maxScore} points.`
      : `Tie between ${winners.map((w) => candidateNames[w]).join(' and ')} with ${maxScore} points each.`);

  return {
    winner: winners.length === 1 ? winners[0] : winners,
    scores,
    explanation,
  };
}

// Plurality Implementation
export function plurality(problem: VotingProblem): VotingResult {
  const { candidates, voters } = problem;
  const scores: Record<string, number> = {};

  candidates.forEach((c) => {
    scores[c.id] = 0;
  });

  voters.forEach((voter) => {
    if (voter.ranking.length > 0) {
      scores[voter.ranking[0]] += 1;
    }
  });

  const maxScore = Math.max(...Object.values(scores));
  const winners = candidates.filter((c) => scores[c.id] === maxScore).map((c) => c.id);

  const candidateNames = Object.fromEntries(candidates.map((c) => [c.id, c.name]));
  const sortedCandidates = [...candidates].sort((a, b) => scores[b.id] - scores[a.id]);
  const scoreList = sortedCandidates
    .map((c) => `${c.name}: ${scores[c.id]} votes`)
    .join(', ');

  const explanation =
    `Each voter's first choice receives one vote.\n\n` +
    `Vote counts: ${scoreList}\n\n` +
    (winners.length === 1
      ? `${candidateNames[winners[0]]} wins with ${maxScore} votes.`
      : `Tie between ${winners.map((w) => candidateNames[w]).join(' and ')} with ${maxScore} votes each.`);

  return {
    winner: winners.length === 1 ? winners[0] : winners,
    scores,
    explanation,
  };
}

// Instant Runoff Voting Implementation
export function instantRunoff(problem: VotingProblem): VotingResult {
  const { candidates, voters } = problem;
  const candidateNames = Object.fromEntries(candidates.map((c) => [c.id, c.name]));
  const totalVoters = voters.length;
  const majorityThreshold = Math.floor(totalVoters / 2) + 1;

  let remainingCandidates = candidates.map((c) => c.id);
  let currentBallots = voters.map((v) => [...v.ranking]);
  const rounds: string[] = [];
  const finalScores: Record<string, number> = {};

  candidates.forEach((c) => {
    finalScores[c.id] = 0;
  });

  let round = 1;
  while (remainingCandidates.length > 1) {
    // Count first-place votes among remaining candidates
    const roundScores: Record<string, number> = {};
    remainingCandidates.forEach((id) => {
      roundScores[id] = 0;
    });

    currentBallots.forEach((ballot) => {
      const topChoice = ballot.find((c) => remainingCandidates.includes(c));
      if (topChoice) {
        roundScores[topChoice] += 1;
      }
    });

    // Update final scores to reflect this round
    Object.entries(roundScores).forEach(([id, score]) => {
      finalScores[id] = score;
    });

    const sortedByVotes = remainingCandidates
      .map((id) => ({ id, votes: roundScores[id] }))
      .sort((a, b) => b.votes - a.votes);

    const roundSummary = sortedByVotes
      .map((c) => `${candidateNames[c.id]}: ${c.votes}`)
      .join(', ');

    // Check if leader has majority
    if (sortedByVotes[0].votes >= majorityThreshold) {
      rounds.push(`Round ${round}: ${roundSummary}\n${candidateNames[sortedByVotes[0].id]} has a majority!`);
      break;
    }

    // Find candidate(s) with fewest votes
    const minVotes = sortedByVotes[sortedByVotes.length - 1].votes;
    const eliminated = sortedByVotes.filter((c) => c.votes === minVotes);

    // Eliminate all candidates tied for last place
    const eliminatedIds = eliminated.map((c) => c.id);
    const eliminatedNames = eliminatedIds.map((id) => candidateNames[id]).join(', ');
    rounds.push(`Round ${round}: ${roundSummary}\nEliminated: ${eliminatedNames} (${minVotes} votes)`);

    remainingCandidates = remainingCandidates.filter((id) => !eliminatedIds.includes(id));
    round++;
  }

  // Determine winner
  const winner = remainingCandidates[0];
  const winnerVotes = finalScores[winner];

  const explanation =
    `Instant Runoff Voting eliminates the candidate with fewest votes each round.\n` +
    `Majority needed: ${majorityThreshold} of ${totalVoters} votes.\n\n` +
    rounds.join('\n\n') +
    `\n\n${candidateNames[winner]} wins with ${winnerVotes} votes.`;

  return {
    winner,
    scores: finalScores,
    explanation,
    roundByRound: rounds.map((desc, i) => ({
      round: i + 1,
      scores: {},
      description: desc,
    })),
  };
}

// Approval Voting Implementation
export function approvalVoting(
  problem: VotingProblem,
  approvalThreshold: number = Math.ceil(problem.candidates.length / 2)
): VotingResult {
  const { candidates, voters } = problem;
  const scores: Record<string, number> = {};

  candidates.forEach((c) => {
    scores[c.id] = 0;
  });

  voters.forEach((voter) => {
    voter.ranking.slice(0, approvalThreshold).forEach((candidateId) => {
      scores[candidateId] += 1;
    });
  });

  const maxScore = Math.max(...Object.values(scores));
  const winners = candidates.filter((c) => scores[c.id] === maxScore).map((c) => c.id);

  const candidateNames = Object.fromEntries(candidates.map((c) => [c.id, c.name]));
  const sortedCandidates = [...candidates].sort((a, b) => scores[b.id] - scores[a.id]);
  const scoreList = sortedCandidates
    .map((c) => `${c.name}: ${scores[c.id]} approvals`)
    .join(', ');

  const explanation =
    `Each voter approves their top ${approvalThreshold} candidates.\n\n` +
    `Approval counts: ${scoreList}\n\n` +
    (winners.length === 1
      ? `${candidateNames[winners[0]]} wins with ${maxScore} approvals.`
      : `Tie between ${winners.map((w) => candidateNames[w]).join(' and ')} with ${maxScore} approvals each.`);

  return {
    winner: winners.length === 1 ? winners[0] : winners,
    scores,
    explanation,
  };
}

// Condorcet (Copeland) Implementation
export function condorcet(problem: VotingProblem): VotingResult {
  const { candidates, voters } = problem;
  const n = candidates.length;

  const pairwise: Record<string, Record<string, number>> = {};
  candidates.forEach((c1) => {
    pairwise[c1.id] = {};
    candidates.forEach((c2) => {
      pairwise[c1.id][c2.id] = 0;
    });
  });

  voters.forEach((voter) => {
    for (let i = 0; i < voter.ranking.length; i++) {
      for (let j = i + 1; j < voter.ranking.length; j++) {
        pairwise[voter.ranking[i]][voter.ranking[j]] += 1;
      }
    }
  });

  const scores: Record<string, number> = {};
  candidates.forEach((c) => {
    scores[c.id] = 0;
  });

  const pairwiseResults: string[] = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const c1 = candidates[i].id;
      const c2 = candidates[j].id;
      const c1VsC2 = pairwise[c1][c2];
      const c2VsC1 = pairwise[c2][c1];

      if (c1VsC2 > c2VsC1) {
        scores[c1] += 1;
        scores[c2] -= 1;
        pairwiseResults.push(
          `${candidates[i].name} beats ${candidates[j].name} (${c1VsC2}-${c2VsC1})`
        );
      } else if (c2VsC1 > c1VsC2) {
        scores[c2] += 1;
        scores[c1] -= 1;
        pairwiseResults.push(
          `${candidates[j].name} beats ${candidates[i].name} (${c2VsC1}-${c1VsC2})`
        );
      } else {
        pairwiseResults.push(
          `${candidates[i].name} ties ${candidates[j].name} (${c1VsC2}-${c2VsC1})`
        );
      }
    }
  }

  const maxScore = Math.max(...Object.values(scores));
  const winners = candidates.filter((c) => scores[c.id] === maxScore).map((c) => c.id);

  const candidateNames = Object.fromEntries(candidates.map((c) => [c.id, c.name]));
  const sortedCandidates = [...candidates].sort((a, b) => scores[b.id] - scores[a.id]);
  const scoreList = sortedCandidates
    .map((c) => `${c.name}: ${scores[c.id]}`)
    .join(', ');

  const explanation =
    `Comparing all pairs of candidates:\n${pairwiseResults.join('\n')}\n\n` +
    `Copeland scores (wins - losses): ${scoreList}\n\n` +
    (winners.length === 1
      ? `${candidateNames[winners[0]]} is the Condorcet winner.`
      : `No clear Condorcet winner. Tie between ${winners.map((w) => candidateNames[w]).join(' and ')}.`);

  return {
    winner: winners.length === 1 ? winners[0] : winners,
    scores,
    explanation,
  };
}

// Schulze Method Implementation
export function schulze(problem: VotingProblem): VotingResult {
  const { candidates, voters } = problem;
  const n = candidates.length;
  const ids = candidates.map((c) => c.id);
  const candidateNames = Object.fromEntries(candidates.map((c) => [c.id, c.name]));

  const idx: Record<string, number> = {};
  ids.forEach((id, i) => {
    idx[id] = i;
  });

  // Pairwise preference counts: d[i][j] = voters preferring i over j
  const d: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  voters.forEach((voter) => {
    for (let i = 0; i < voter.ranking.length; i++) {
      for (let j = i + 1; j < voter.ranking.length; j++) {
        const a = idx[voter.ranking[i]];
        const b = idx[voter.ranking[j]];
        if (a !== undefined && b !== undefined) d[a][b] += 1;
      }
    }
  });

  // Initial path strengths
  const p: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) p[i][j] = d[i][j] > d[j][i] ? d[i][j] : 0;
    }
  }

  // Floyd–Warshall: strongest beatpath as max-min over paths
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      if (i === k) continue;
      for (let j = 0; j < n; j++) {
        if (j === i || j === k) continue;
        const alt = Math.min(p[i][k], p[k][j]);
        if (alt > p[i][j]) p[i][j] = alt;
      }
    }
  }

  // Schulze winners: i wins iff p[i][j] >= p[j][i] for all j != i
  const wins: number[] = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let beats = 0;
    for (let j = 0; j < n; j++) {
      if (i !== j && p[i][j] >= p[j][i]) beats += 1;
    }
    wins[i] = beats;
  }
  const maxWins = Math.max(...wins);
  const winners = ids.filter((_, i) => wins[i] === maxWins);

  const scores: Record<string, number> = {};
  ids.forEach((id, i) => {
    scores[id] = wins[i];
  });

  const pairwiseLines: string[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairwiseLines.push(
        `${candidateNames[ids[i]]} vs ${candidateNames[ids[j]]}: ${d[i][j]}–${d[j][i]} (strongest path ${p[i][j]} vs ${p[j][i]})`
      );
    }
  }

  const explanation =
    `The Schulze method ranks candidates by the strongest beatpath between them.\n\n` +
    `Pairwise comparisons:\n${pairwiseLines.join('\n')}\n\n` +
    `Beatpath wins (candidates beaten by stronger or equal path strength):\n` +
    ids.map((id, i) => `- ${candidateNames[id]}: beats ${wins[i]} of ${n - 1}`).join('\n') +
    `\n\n` +
    (winners.length === 1
      ? `${candidateNames[winners[0]]} is the Schulze winner.`
      : `Tie among ${winners.map((w) => candidateNames[w]).join(', ')}.`);

  return {
    winner: winners.length === 1 ? winners[0] : winners,
    scores,
    explanation,
  };
}

// Main function to run any voting mechanism
export function runVotingMechanism(
  mechanismId: string,
  problem: VotingProblem
): VotingResult {
  switch (mechanismId) {
    case 'borda':
      return bordaCount(problem);
    case 'plurality':
      return plurality(problem);
    case 'irv':
      return instantRunoff(problem);
    case 'approval':
      return approvalVoting(problem);
    case 'condorcet':
      return condorcet(problem);
    case 'schulze':
      return schulze(problem);
    default:
      throw new Error(`Unknown voting mechanism: ${mechanismId}`);
  }
}

'use strict';

/**
 * Example: Kelly Criterion staking strategy
 *
 * Scenario: You have a 2 BTC bankroll and are evaluating several bets
 * using the Kelly Criterion to determine optimal stake sizes.
 */

const odds = require('../index');

const BTC_PRICE = 67000;
const bankroll = 2.0; // 2 BTC

console.log('=== Kelly Criterion Staking Strategy ===\n');
console.log(`Bankroll: ${bankroll} BTC ($${(bankroll * BTC_PRICE).toLocaleString()})\n`);

// Bets to evaluate
const bets = [
  {
    name: 'Bitcoin > $70k by Friday',
    decimalOdds: 2.50,
    estimatedProbability: 0.55,
  },
  {
    name: 'Lakers to win NBA Finals',
    decimalOdds: 6.00,
    estimatedProbability: 0.20,
  },
  {
    name: 'Over 2.5 goals in Man City vs Arsenal',
    decimalOdds: 1.80,
    estimatedProbability: 0.65,
  },
  {
    name: 'Trump to win election (no edge)',
    decimalOdds: 2.00,
    estimatedProbability: 0.45, // below breakeven
  },
  {
    name: 'Ethereum flips Bitcoin (long shot)',
    decimalOdds: 15.00,
    estimatedProbability: 0.08,
  },
];

console.log('Bet Analysis:\n');
console.log(
  'Bet'.padEnd(42) +
  'Odds'.padEnd(8) +
  'Prob'.padEnd(8) +
  'Implied'.padEnd(10) +
  'Edge'.padEnd(10) +
  'Kelly%'.padEnd(10) +
  'Stake (BTC)'.padEnd(14) +
  'Stake (USD)'
);
console.log('-'.repeat(112));

let totalAllocated = 0;

bets.forEach((bet) => {
  const kelly = odds.kellyStake(bet.estimatedProbability, bet.decimalOdds, bankroll);
  const implied = odds.impliedProbability(bet.decimalOdds);

  const probStr = (bet.estimatedProbability * 100).toFixed(0) + '%';
  const impliedStr = (implied * 100).toFixed(1) + '%';
  const edgeStr = kelly.edge.toFixed(1) + '%';
  const kellyPct = (kelly.fraction * 100).toFixed(1) + '%';
  const stakeStr = kelly.stake.toFixed(4);
  const usdStr = '$' + (kelly.stake * BTC_PRICE).toFixed(2);

  console.log(
    bet.name.padEnd(42) +
    bet.decimalOdds.toFixed(2).padEnd(8) +
    probStr.padEnd(8) +
    impliedStr.padEnd(10) +
    edgeStr.padEnd(10) +
    kellyPct.padEnd(10) +
    stakeStr.padEnd(14) +
    usdStr
  );

  totalAllocated += kelly.stake;
});

console.log('-'.repeat(112));
console.log(
  'TOTAL ALLOCATED'.padEnd(90) +
  totalAllocated.toFixed(4).padEnd(14) +
  '$' + (totalAllocated * BTC_PRICE).toFixed(2)
);
console.log(
  'REMAINING BANKROLL'.padEnd(90) +
  (bankroll - totalAllocated).toFixed(4).padEnd(14) +
  '$' + ((bankroll - totalAllocated) * BTC_PRICE).toFixed(2)
);

// Fractional Kelly recommendation
console.log('\n=== Fractional Kelly (Conservative) ===\n');
console.log('Many sharp bettors use half-Kelly or quarter-Kelly to reduce variance.\n');

[1, 0.5, 0.25].forEach((fraction) => {
  const label =
    fraction === 1 ? 'Full Kelly' : fraction === 0.5 ? 'Half Kelly' : 'Quarter Kelly';

  let total = 0;
  bets.forEach((bet) => {
    const kelly = odds.kellyStake(bet.estimatedProbability, bet.decimalOdds, bankroll);
    total += kelly.stake * fraction;
  });

  console.log(`  ${label.padEnd(16)} Total: ${total.toFixed(4)} BTC ($${(total * BTC_PRICE).toFixed(2)})`);
});

// EV summary
console.log('\n=== Expected Value Summary ===\n');
bets.forEach((bet) => {
  const kelly = odds.kellyStake(bet.estimatedProbability, bet.decimalOdds, bankroll);
  if (kelly.stake > 0) {
    const ev = odds.calculateEV(bet.estimatedProbability, bet.decimalOdds, kelly.stake);
    console.log(
      `  ${bet.name.padEnd(42)} EV: ${ev > 0 ? '+' : ''}${ev.toFixed(6)} BTC ($${(ev * BTC_PRICE).toFixed(2)})`
    );
  } else {
    console.log(`  ${bet.name.padEnd(42)} SKIP (no edge)`);
  }
});

'use strict';

/**
 * Example: Calculate a 4-leg parlay with BTC payouts
 *
 * Scenario: You're placing a 4-leg parlay on crypto sportsbook with 0.01 BTC
 */

const odds = require('../index');

// Current BTC price in USD
const BTC_PRICE = 67000;

// Stake in BTC
const stake = 0.01; // 0.01 BTC (~$670)

// 4-leg parlay selections (decimal odds)
const legs = [
  { name: 'Lakers ML',        odds: 1.75 },
  { name: 'Over 210.5 pts',   odds: 1.90 },
  { name: 'Chiefs -3.5',      odds: 1.85 },
  { name: 'Arsenal to Win',   odds: 2.10 },
];

console.log('=== 4-Leg Parlay Calculator ===\n');
console.log(`Stake: ${stake} BTC ($${(stake * BTC_PRICE).toFixed(2)})\n`);

// Show each leg
console.log('Legs:');
legs.forEach((leg, i) => {
  const american = odds.decimalToAmerican(leg.odds);
  const prob = odds.impliedProbability(leg.odds);
  console.log(
    `  ${i + 1}. ${leg.name} — ${leg.odds} decimal (${american > 0 ? '+' : ''}${american}) — ${(prob * 100).toFixed(1)}% implied`
  );
});

// Calculate parlay
const decimalOdds = legs.map((l) => l.odds);
const result = odds.parlayPayout(stake, decimalOdds);

console.log(`\nCombined Odds: ${result.combinedOdds} decimal (${odds.decimalToAmerican(result.combinedOdds) > 0 ? '+' : ''}${odds.decimalToAmerican(result.combinedOdds)})`);
console.log(`Combined Implied Probability: ${(odds.impliedProbability(result.combinedOdds) * 100).toFixed(2)}%`);

// Crypto payout
const payout = odds.cryptoPayout(stake, result.combinedOdds, BTC_PRICE);

console.log(`\n--- Payouts ---`);
console.log(`BTC Payout:  ${payout.cryptoPayout.toFixed(8)} BTC`);
console.log(`BTC Profit:  ${payout.cryptoProfit.toFixed(8)} BTC`);
console.log(`USD Payout:  $${payout.fiatPayout.toFixed(2)}`);
console.log(`USD Profit:  $${payout.fiatProfit.toFixed(2)}`);

// EV calculation (assume you estimate true probabilities)
const trueProbabilities = [0.55, 0.48, 0.50, 0.42];
const combinedTrueProb = trueProbabilities.reduce((a, b) => a * b, 1);
const ev = odds.calculateEV(combinedTrueProb, result.combinedOdds, stake);

console.log(`\n--- Expected Value Analysis ---`);
console.log(`Your estimated true probability: ${(combinedTrueProb * 100).toFixed(2)}%`);
console.log(`Book implied probability:        ${(odds.impliedProbability(result.combinedOdds) * 100).toFixed(2)}%`);
console.log(`EV: ${ev > 0 ? '+' : ''}${ev.toFixed(8)} BTC ($${(ev * BTC_PRICE).toFixed(2)})`);
console.log(`Verdict: ${ev > 0 ? 'POSITIVE EV — consider the bet' : 'NEGATIVE EV — pass or reduce stake'}`);

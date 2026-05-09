'use strict';

const assert = require('assert');
const odds = require('./index');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failed++;
    console.error(`  FAIL  ${name}`);
    console.error(`        ${err.message}`);
  }
}

function approx(actual, expected, tolerance = 0.01) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ~${expected}, got ${actual}`
  );
}

// ===========================================================================
console.log('\n--- Decimal to American ---');
// ===========================================================================

test('decimal 2.5 => +150', () => {
  assert.strictEqual(odds.decimalToAmerican(2.5), 150);
});

test('decimal 1.5 => -200', () => {
  assert.strictEqual(odds.decimalToAmerican(1.5), -200);
});

test('decimal 2.0 => +100', () => {
  assert.strictEqual(odds.decimalToAmerican(2.0), 100);
});

test('decimal 1.25 => -400', () => {
  assert.strictEqual(odds.decimalToAmerican(1.25), -400);
});

test('decimal 5.0 => +400', () => {
  assert.strictEqual(odds.decimalToAmerican(5.0), 400);
});

test('decimal 1.01 => -10000', () => {
  assert.strictEqual(odds.decimalToAmerican(1.01), -10000);
});

test('throws for decimal <= 1', () => {
  assert.throws(() => odds.decimalToAmerican(1), /greater than 1/);
  assert.throws(() => odds.decimalToAmerican(0.5), /greater than 1/);
});

// ===========================================================================
console.log('\n--- American to Decimal ---');
// ===========================================================================

test('+150 => 2.5', () => {
  assert.strictEqual(odds.americanToDecimal(150), 2.5);
});

test('-200 => 1.5', () => {
  assert.strictEqual(odds.americanToDecimal(-200), 1.5);
});

test('+100 => 2.0', () => {
  assert.strictEqual(odds.americanToDecimal(100), 2.0);
});

test('-400 => 1.25', () => {
  assert.strictEqual(odds.americanToDecimal(-400), 1.25);
});

test('throws for american = 0', () => {
  assert.throws(() => odds.americanToDecimal(0), /non-zero/);
});

// ===========================================================================
console.log('\n--- Decimal to Fractional ---');
// ===========================================================================

test('decimal 2.5 => "3/2"', () => {
  assert.strictEqual(odds.decimalToFractional(2.5), '3/2');
});

test('decimal 3.0 => "2/1"', () => {
  assert.strictEqual(odds.decimalToFractional(3.0), '2/1');
});

test('decimal 1.5 => "1/2"', () => {
  assert.strictEqual(odds.decimalToFractional(1.5), '1/2');
});

test('decimal 6.0 => "5/1"', () => {
  assert.strictEqual(odds.decimalToFractional(6.0), '5/1');
});

test('decimal 2.1 => "11/10"', () => {
  assert.strictEqual(odds.decimalToFractional(2.1), '11/10');
});

test('throws for decimal <= 1', () => {
  assert.throws(() => odds.decimalToFractional(1), /greater than 1/);
});

// ===========================================================================
console.log('\n--- Fractional to Decimal ---');
// ===========================================================================

test('"3/2" => 2.5', () => {
  assert.strictEqual(odds.fractionalToDecimal('3/2'), 2.5);
});

test('"5/1" => 6.0', () => {
  assert.strictEqual(odds.fractionalToDecimal('5/1'), 6.0);
});

test('"1/2" => 1.5', () => {
  assert.strictEqual(odds.fractionalToDecimal('1/2'), 1.5);
});

test('"11/10" => 2.1', () => {
  assert.strictEqual(odds.fractionalToDecimal('11/10'), 2.1);
});

test('throws for bad format', () => {
  assert.throws(() => odds.fractionalToDecimal('abc'), /N\/D/);
  assert.throws(() => odds.fractionalToDecimal(123), /N\/D/);
});

// ===========================================================================
console.log('\n--- Round-trip Conversions ---');
// ===========================================================================

test('decimal -> american -> decimal round-trip', () => {
  const original = 3.75;
  const american = odds.decimalToAmerican(original);
  const back = odds.americanToDecimal(american);
  approx(back, original, 0.05);
});

test('decimal -> fractional -> decimal round-trip', () => {
  const original = 2.5;
  const fractional = odds.decimalToFractional(original);
  const back = odds.fractionalToDecimal(fractional);
  approx(back, original, 0.001);
});

// ===========================================================================
console.log('\n--- Implied Probability ---');
// ===========================================================================

test('decimal 2.0 => 50%', () => {
  assert.strictEqual(odds.impliedProbability(2.0), 0.5);
});

test('decimal 4.0 => 25%', () => {
  assert.strictEqual(odds.impliedProbability(4.0), 0.25);
});

test('decimal 1.5 => ~66.67%', () => {
  approx(odds.impliedProbability(1.5), 0.6667, 0.001);
});

test('decimal 10.0 => 10%', () => {
  assert.strictEqual(odds.impliedProbability(10.0), 0.1);
});

test('throws for odds <= 1', () => {
  assert.throws(() => odds.impliedProbability(0.5), /greater than 1/);
});

// ===========================================================================
console.log('\n--- Calculate EV ---');
// ===========================================================================

test('positive EV bet', () => {
  // 55% chance at 2.0 odds, $100 stake
  // EV = 0.55 * 100 - 0.45 * 100 = 10
  const ev = odds.calculateEV(0.55, 2.0, 100);
  approx(ev, 10, 0.01);
});

test('negative EV bet', () => {
  // 40% chance at 2.0 odds, $100 stake
  // EV = 0.40 * 100 - 0.60 * 100 = -20
  const ev = odds.calculateEV(0.40, 2.0, 100);
  approx(ev, -20, 0.01);
});

test('zero EV (fair odds)', () => {
  // 50% chance at 2.0, $100
  const ev = odds.calculateEV(0.50, 2.0, 100);
  approx(ev, 0, 0.01);
});

test('high odds positive EV', () => {
  // 15% chance at 8.0 odds, $50 stake
  // profit = 50 * 7 = 350
  // EV = 0.15 * 350 - 0.85 * 50 = 52.5 - 42.5 = 10
  const ev = odds.calculateEV(0.15, 8.0, 50);
  approx(ev, 10, 0.01);
});

test('throws for invalid probability', () => {
  assert.throws(() => odds.calculateEV(1.5, 2.0, 100), /between 0 and 1/);
  assert.throws(() => odds.calculateEV(-0.1, 2.0, 100), /between 0 and 1/);
});

// ===========================================================================
console.log('\n--- Parlay Odds ---');
// ===========================================================================

test('2-leg parlay', () => {
  const combined = odds.parlayOdds([2.0, 3.0]);
  assert.strictEqual(combined, 6.0);
});

test('3-leg parlay', () => {
  const combined = odds.parlayOdds([1.5, 2.0, 2.5]);
  approx(combined, 7.5, 0.001);
});

test('single leg', () => {
  const combined = odds.parlayOdds([3.5]);
  assert.strictEqual(combined, 3.5);
});

test('throws for empty array', () => {
  assert.throws(() => odds.parlayOdds([]), /non-empty/);
});

test('throws for invalid leg', () => {
  assert.throws(() => odds.parlayOdds([2.0, 0.5]), /greater than 1/);
});

// ===========================================================================
console.log('\n--- Parlay Payout ---');
// ===========================================================================

test('$100 on 3-leg parlay', () => {
  const result = odds.parlayPayout(100, [1.5, 2.0, 2.5]);
  approx(result.combinedOdds, 7.5, 0.001);
  approx(result.payout, 750, 0.01);
  approx(result.profit, 650, 0.01);
});

test('$50 on 2-leg parlay', () => {
  const result = odds.parlayPayout(50, [2.0, 2.0]);
  approx(result.payout, 200, 0.01);
  approx(result.profit, 150, 0.01);
});

test('throws for zero stake', () => {
  assert.throws(() => odds.parlayPayout(0, [2.0]), /positive/);
});

// ===========================================================================
console.log('\n--- Kelly Criterion ---');
// ===========================================================================

test('positive edge kelly', () => {
  // 60% chance at 2.0 odds, $1000 bankroll
  // b = 1.0, f* = (1*0.6 - 0.4) / 1 = 0.2
  const result = odds.kellyStake(0.6, 2.0, 1000);
  approx(result.fraction, 0.2, 0.001);
  approx(result.stake, 200, 0.1);
  approx(result.edge, 20, 0.1);
});

test('no edge kelly returns zero', () => {
  // 50% chance at 2.0 odds => break even, kelly = 0
  const result = odds.kellyStake(0.5, 2.0, 1000);
  assert.strictEqual(result.fraction, 0);
  assert.strictEqual(result.stake, 0);
});

test('negative edge kelly returns zero', () => {
  // 30% chance at 2.0 odds => negative edge
  const result = odds.kellyStake(0.3, 2.0, 1000);
  assert.strictEqual(result.fraction, 0);
  assert.strictEqual(result.stake, 0);
});

test('long-shot kelly', () => {
  // 15% chance at 10.0 odds, $5000 bankroll
  // b = 9, f* = (9*0.15 - 0.85) / 9 = (1.35 - 0.85) / 9 = 0.0556
  const result = odds.kellyStake(0.15, 10.0, 5000);
  approx(result.fraction, 0.0556, 0.001);
  approx(result.stake, 277.78, 1);
});

test('throws for invalid probability', () => {
  assert.throws(() => odds.kellyStake(1.5, 2.0, 1000), /between 0 and 1/);
});

// ===========================================================================
console.log('\n--- Crypto Payout ---');
// ===========================================================================

test('BTC payout at 2.5 odds', () => {
  // 0.1 BTC at 2.5 odds, BTC = $67000
  const result = odds.cryptoPayout(0.1, 2.5, 67000);
  approx(result.cryptoPayout, 0.25, 0.001);
  approx(result.cryptoProfit, 0.15, 0.001);
  approx(result.fiatPayout, 16750, 1);
  approx(result.fiatProfit, 10050, 1);
});

test('ETH payout at 3.0 odds', () => {
  // 1 ETH at 3.0 odds, ETH = $3500
  const result = odds.cryptoPayout(1, 3.0, 3500);
  approx(result.cryptoPayout, 3.0, 0.001);
  approx(result.cryptoProfit, 2.0, 0.001);
  approx(result.fiatPayout, 10500, 1);
  approx(result.fiatProfit, 7000, 1);
});

test('small stake crypto', () => {
  // 0.001 BTC at 5.0 odds, BTC = $100000
  const result = odds.cryptoPayout(0.001, 5.0, 100000);
  approx(result.cryptoPayout, 0.005, 0.0001);
  approx(result.cryptoProfit, 0.004, 0.0001);
  approx(result.fiatPayout, 500, 1);
  approx(result.fiatProfit, 400, 1);
});

test('throws for invalid crypto inputs', () => {
  assert.throws(() => odds.cryptoPayout(0, 2.0, 67000), /positive/);
  assert.throws(() => odds.cryptoPayout(1, 0.5, 67000), /greater than 1/);
  assert.throws(() => odds.cryptoPayout(1, 2.0, 0), /positive/);
});

// ===========================================================================
console.log('\n--- Hedge Calculator ---');
// ===========================================================================

test('basic hedge calculation', () => {
  // Backed at 4.0 with $100, lay at 2.0
  // layStake = (100 * 4.0) / 2.0 = 200
  // profitIfWin = 100*3 - 200*1 = 300 - 200 = 100
  // profitIfLose = 200 - 100 = 100
  const result = odds.hedgeCalculator(4.0, 100, 2.0);
  assert.strictEqual(result.layStake, 200);
  approx(result.profitIfWin, 100, 0.01);
  approx(result.profitIfLose, 100, 0.01);
});

test('hedge with close odds', () => {
  // Backed at 2.5 with $100, lay at 2.0
  // layStake = (100 * 2.5) / 2.0 = 125
  // profitIfWin = 100*1.5 - 125*1.0 = 150 - 125 = 25
  // profitIfLose = 125 - 100 = 25
  const result = odds.hedgeCalculator(2.5, 100, 2.0);
  assert.strictEqual(result.layStake, 125);
  approx(result.profitIfWin, 25, 0.01);
  approx(result.profitIfLose, 25, 0.01);
});

test('hedge same odds (no profit)', () => {
  // Backed at 3.0 with $100, lay at 3.0
  // layStake = (100 * 3) / 3 = 100
  // profitIfWin = 100*2 - 100*2 = 0
  // profitIfLose = 100 - 100 = 0
  const result = odds.hedgeCalculator(3.0, 100, 3.0);
  approx(result.layStake, 100, 0.01);
  approx(result.profitIfWin, 0, 0.01);
  approx(result.profitIfLose, 0, 0.01);
});

test('throws for invalid hedge inputs', () => {
  assert.throws(() => odds.hedgeCalculator(0.5, 100, 2.0), /greater than 1/);
  assert.throws(() => odds.hedgeCalculator(2.0, 0, 2.0), /positive/);
});

// ===========================================================================
// Summary
// ===========================================================================

console.log(`\n========================================`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}

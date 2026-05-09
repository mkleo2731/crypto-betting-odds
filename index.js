'use strict';

/**
 * crypto-betting-odds
 *
 * A zero-dependency JavaScript utility library for converting and calculating
 * betting odds across decimal, American, and fractional formats — with built-in
 * crypto payout support.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Greatest common divisor (Euclidean algorithm).
 * Used internally for fractional odds simplification.
 */
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

/**
 * Round a number to a given number of decimal places.
 */
function round(value, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ---------------------------------------------------------------------------
// Odds Conversion
// ---------------------------------------------------------------------------

/**
 * Convert decimal odds to American odds.
 *
 * - Decimal >= 2.0  =>  positive American:  (decimal - 1) * 100
 * - Decimal < 2.0   =>  negative American: -100 / (decimal - 1)
 *
 * @param {number} decimal - Decimal odds (must be > 1).
 * @returns {number} American odds (positive or negative integer).
 */
function decimalToAmerican(decimal) {
  if (typeof decimal !== 'number' || decimal <= 1) {
    throw new Error('Decimal odds must be a number greater than 1');
  }
  if (decimal >= 2) {
    return round((decimal - 1) * 100, 0);
  }
  return round(-100 / (decimal - 1), 0);
}

/**
 * Convert American odds to decimal odds.
 *
 * - Positive American:  (american / 100) + 1
 * - Negative American:  (100 / |american|) + 1
 *
 * @param {number} american - American odds (positive or negative, never zero).
 * @returns {number} Decimal odds.
 */
function americanToDecimal(american) {
  if (typeof american !== 'number' || american === 0) {
    throw new Error('American odds must be a non-zero number');
  }
  if (american > 0) {
    return round(american / 100 + 1, 4);
  }
  return round(100 / Math.abs(american) + 1, 4);
}

/**
 * Convert decimal odds to fractional odds (as a string, e.g. "5/1").
 *
 * The fraction is fully reduced via GCD.
 *
 * @param {number} decimal - Decimal odds (must be > 1).
 * @returns {string} Fractional odds string like "5/1" or "11/10".
 */
function decimalToFractional(decimal) {
  if (typeof decimal !== 'number' || decimal <= 1) {
    throw new Error('Decimal odds must be a number greater than 1');
  }
  // Represent (decimal - 1) as a fraction with denominator = large power of 10
  // to handle floating-point, then reduce.
  const profit = decimal - 1;
  const precision = 10000;
  let numerator = Math.round(profit * precision);
  let denominator = precision;
  const d = gcd(numerator, denominator);
  numerator /= d;
  denominator /= d;
  return `${numerator}/${denominator}`;
}

/**
 * Convert fractional odds (string) to decimal odds.
 *
 * @param {string} fractional - Fractional odds string, e.g. "5/1" or "11/10".
 * @returns {number} Decimal odds.
 */
function fractionalToDecimal(fractional) {
  if (typeof fractional !== 'string' || !fractional.includes('/')) {
    throw new Error('Fractional odds must be a string in "N/D" format');
  }
  const parts = fractional.split('/');
  const numerator = parseFloat(parts[0]);
  const denominator = parseFloat(parts[1]);
  if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
    throw new Error('Invalid fractional odds');
  }
  return round(numerator / denominator + 1, 4);
}

// ---------------------------------------------------------------------------
// Probability & Expected Value
// ---------------------------------------------------------------------------

/**
 * Calculate the implied probability from decimal odds.
 *
 * implied probability = 1 / decimal
 *
 * @param {number} decimal - Decimal odds (must be > 1).
 * @returns {number} Implied probability between 0 and 1.
 */
function impliedProbability(decimal) {
  if (typeof decimal !== 'number' || decimal <= 1) {
    throw new Error('Decimal odds must be a number greater than 1');
  }
  return round(1 / decimal, 6);
}

/**
 * Calculate expected value of a bet.
 *
 * EV = (probability * profit) - ((1 - probability) * stake)
 * where profit = stake * (decimal - 1)
 *
 * @param {number} probability - True win probability (0 to 1).
 * @param {number} decimal     - Decimal odds offered.
 * @param {number} stake       - Amount wagered.
 * @returns {number} Expected value (positive = +EV, negative = -EV).
 */
function calculateEV(probability, decimal, stake) {
  if (probability < 0 || probability > 1) {
    throw new Error('Probability must be between 0 and 1');
  }
  if (decimal <= 1) {
    throw new Error('Decimal odds must be greater than 1');
  }
  if (stake <= 0) {
    throw new Error('Stake must be positive');
  }
  const profit = stake * (decimal - 1);
  const ev = probability * profit - (1 - probability) * stake;
  return round(ev, 4);
}

// ---------------------------------------------------------------------------
// Parlay / Accumulator
// ---------------------------------------------------------------------------

/**
 * Calculate combined decimal odds for a parlay (accumulator).
 *
 * Combined odds = product of all individual decimal odds.
 *
 * @param {number[]} legs - Array of decimal odds for each leg.
 * @returns {number} Combined decimal odds.
 */
function parlayOdds(legs) {
  if (!Array.isArray(legs) || legs.length === 0) {
    throw new Error('Legs must be a non-empty array of decimal odds');
  }
  for (const leg of legs) {
    if (typeof leg !== 'number' || leg <= 1) {
      throw new Error('Each leg must be decimal odds greater than 1');
    }
  }
  const combined = legs.reduce((acc, odds) => acc * odds, 1);
  return round(combined, 4);
}

/**
 * Calculate total payout for a parlay bet.
 *
 * payout = stake * combinedOdds
 *
 * @param {number}   stake - Amount wagered.
 * @param {number[]} legs  - Array of decimal odds for each leg.
 * @returns {{ combinedOdds: number, payout: number, profit: number }}
 */
function parlayPayout(stake, legs) {
  if (typeof stake !== 'number' || stake <= 0) {
    throw new Error('Stake must be a positive number');
  }
  const combined = parlayOdds(legs);
  const payout = round(stake * combined, 4);
  const profit = round(payout - stake, 4);
  return { combinedOdds: combined, payout, profit };
}

// ---------------------------------------------------------------------------
// Kelly Criterion
// ---------------------------------------------------------------------------

/**
 * Calculate optimal stake using the Kelly Criterion.
 *
 * Kelly fraction f* = (bp - q) / b
 * where b = decimal - 1 (net odds), p = probability, q = 1 - p
 *
 * Returns 0 when the edge is non-positive (no bet recommended).
 *
 * @param {number} probability - Estimated true win probability (0 to 1).
 * @param {number} decimal     - Decimal odds offered by the book.
 * @param {number} bankroll    - Total bankroll.
 * @returns {{ fraction: number, stake: number, edge: number }}
 */
function kellyStake(probability, decimal, bankroll) {
  if (probability < 0 || probability > 1) {
    throw new Error('Probability must be between 0 and 1');
  }
  if (decimal <= 1) {
    throw new Error('Decimal odds must be greater than 1');
  }
  if (bankroll <= 0) {
    throw new Error('Bankroll must be positive');
  }
  const b = decimal - 1; // net fractional odds
  const p = probability;
  const q = 1 - p;
  const fraction = (b * p - q) / b;
  const edge = round(fraction * 100, 2); // percentage edge

  if (fraction <= 0) {
    return { fraction: 0, stake: 0, edge };
  }

  return {
    fraction: round(fraction, 6),
    stake: round(fraction * bankroll, 4),
    edge,
  };
}

// ---------------------------------------------------------------------------
// Crypto Payouts
// ---------------------------------------------------------------------------

/**
 * Calculate payouts denominated in cryptocurrency.
 *
 * @param {number} stake      - Stake in crypto units (e.g. 0.05 BTC).
 * @param {number} odds       - Decimal odds.
 * @param {number} cryptoPrice - Current fiat price of one crypto unit (e.g. 67000 for BTC).
 * @returns {{ cryptoPayout: number, cryptoProfit: number, fiatPayout: number, fiatProfit: number }}
 */
function cryptoPayout(stake, odds, cryptoPrice) {
  if (typeof stake !== 'number' || stake <= 0) {
    throw new Error('Stake must be a positive number');
  }
  if (typeof odds !== 'number' || odds <= 1) {
    throw new Error('Odds must be decimal odds greater than 1');
  }
  if (typeof cryptoPrice !== 'number' || cryptoPrice <= 0) {
    throw new Error('Crypto price must be a positive number');
  }

  const cryptoPayoutTotal = round(stake * odds, 8);
  const cryptoProfitTotal = round(cryptoPayoutTotal - stake, 8);
  const fiatPayout = round(cryptoPayoutTotal * cryptoPrice, 2);
  const fiatProfit = round(cryptoProfitTotal * cryptoPrice, 2);

  return {
    cryptoPayout: cryptoPayoutTotal,
    cryptoProfit: cryptoProfitTotal,
    fiatPayout,
    fiatProfit,
  };
}

// ---------------------------------------------------------------------------
// Hedge Calculator
// ---------------------------------------------------------------------------

/**
 * Calculate the lay (hedge) stake and guaranteed profit.
 *
 * Given a back bet already placed, calculate how much to lay (bet against)
 * at current lay odds to lock in a guaranteed profit regardless of outcome.
 *
 * layStake = (backOdds * backStake) / layOdds
 * profitIfBackWins  = backStake * (backOdds - 1) - layStake * (layOdds - 1)  [should ≈ 0 or equal for full hedge]
 * profitIfBackLoses = layStake - backStake  [not useful when hedging]
 *
 * Full-hedge formula (equal profit both ways):
 *   layStake = (backStake * backOdds) / layOdds
 *   guaranteedProfit = backStake * backOdds - layStake * layOdds
 *     ... simplified: guaranteedProfit = backStake * backOdds * (1 - 1) = 0 only if backOdds == layOdds
 *
 * More useful: given back already placed, find lay stake so profit is equal either way.
 *   Let P = guaranteed profit
 *   If back wins:  P = backStake*(backOdds-1) - layStake*(layOdds-1)
 *   If back loses:  P = layStake - backStake
 *   Setting equal: backStake*(backOdds-1) - layStake*(layOdds-1) = layStake - backStake
 *   => backStake*backOdds = layStake*layOdds
 *   => layStake = (backStake * backOdds) / layOdds
 *   => P = layStake - backStake
 *
 * @param {number} backOdds  - Decimal odds of the original back bet.
 * @param {number} backStake - Stake placed on the original back bet.
 * @param {number} layOdds   - Current decimal odds available for laying.
 * @returns {{ layStake: number, profitIfWin: number, profitIfLose: number, guaranteedProfit: number }}
 */
function hedgeCalculator(backOdds, backStake, layOdds) {
  if (backOdds <= 1 || layOdds <= 1) {
    throw new Error('Odds must be greater than 1');
  }
  if (backStake <= 0) {
    throw new Error('Back stake must be positive');
  }

  const layStake = round((backStake * backOdds) / layOdds, 4);
  const profitIfWin = round(backStake * (backOdds - 1) - layStake * (layOdds - 1), 4);
  const profitIfLose = round(layStake - backStake, 4);

  // The guaranteed profit when lay stake is calculated for equal outcomes
  // equals profitIfLose (since profitIfWin ≈ profitIfLose with this formula)
  const guaranteedProfit = profitIfLose;

  return {
    layStake,
    profitIfWin,
    profitIfLose,
    guaranteedProfit,
  };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  // Conversions
  decimalToAmerican,
  americanToDecimal,
  decimalToFractional,
  fractionalToDecimal,

  // Probability & EV
  impliedProbability,
  calculateEV,

  // Parlay
  parlayOdds,
  parlayPayout,

  // Kelly
  kellyStake,

  // Crypto
  cryptoPayout,

  // Hedging
  hedgeCalculator,
};

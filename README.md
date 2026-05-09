# crypto-betting-odds

[![npm version](https://img.shields.io/npm/v/crypto-betting-odds.svg)](https://www.npmjs.com/package/crypto-betting-odds)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](package.json)

A zero-dependency JavaScript utility library for converting and calculating betting odds across formats -- decimal, American, fractional -- with built-in crypto payout support and bankroll management tools.

## Features

- **Odds Conversion** -- Decimal, American, and Fractional formats
- **Implied Probability** -- Convert odds to win probability
- **Parlay Calculator** -- Combine multiple legs, calculate payouts
- **Kelly Criterion** -- Optimal bankroll-based stake sizing
- **Expected Value** -- Determine +EV and -EV bets
- **Crypto Payouts** -- BTC/ETH denominated payout calculations
- **Hedge Calculator** -- Lock in guaranteed profit with lay bets
- **Zero Dependencies** -- Lightweight, no bloat

## Installation

```bash
npm install crypto-betting-odds
```

Or simply copy `index.js` into your project.

## Quick Start

```js
const odds = require('crypto-betting-odds');

// Convert decimal odds to American
odds.decimalToAmerican(2.5);    // 150  (+150)
odds.decimalToAmerican(1.5);    // -200

// Calculate a 3-leg parlay payout
odds.parlayPayout(100, [1.91, 2.10, 1.75]);
// { combinedOdds: 7.0148, payout: 701.4825, profit: 601.4825 }

// Kelly Criterion optimal stake
odds.kellyStake(0.6, 2.0, 1000);
// { fraction: 0.2, stake: 200, edge: 20 }

// Crypto payout in BTC
odds.cryptoPayout(0.01, 3.5, 67000);
// { cryptoPayout: 0.035, cryptoProfit: 0.025, fiatPayout: 2345, fiatProfit: 1675 }
```

## API Reference

### Odds Conversion

#### `decimalToAmerican(decimal)`

Convert decimal odds to American odds.

| Parameter | Type | Description |
|-----------|------|-------------|
| `decimal` | `number` | Decimal odds (must be > 1) |

**Returns:** `number` -- American odds (positive or negative).

```js
odds.decimalToAmerican(2.5);   // 150
odds.decimalToAmerican(1.25);  // -400
```

---

#### `americanToDecimal(american)`

Convert American odds to decimal odds.

| Parameter | Type | Description |
|-----------|------|-------------|
| `american` | `number` | American odds (non-zero) |

**Returns:** `number` -- Decimal odds.

```js
odds.americanToDecimal(150);   // 2.5
odds.americanToDecimal(-200);  // 1.5
```

---

#### `decimalToFractional(decimal)`

Convert decimal odds to fractional odds string.

| Parameter | Type | Description |
|-----------|------|-------------|
| `decimal` | `number` | Decimal odds (must be > 1) |

**Returns:** `string` -- Fractional odds (e.g., `"5/1"`).

```js
odds.decimalToFractional(6.0);  // "5/1"
odds.decimalToFractional(2.5);  // "3/2"
```

---

#### `fractionalToDecimal(fractional)`

Convert fractional odds string to decimal odds.

| Parameter | Type | Description |
|-----------|------|-------------|
| `fractional` | `string` | Fractional odds (e.g., `"5/1"`) |

**Returns:** `number` -- Decimal odds.

```js
odds.fractionalToDecimal("5/1");   // 6.0
odds.fractionalToDecimal("3/2");   // 2.5
```

---

### Probability & Expected Value

#### `impliedProbability(decimal)`

Calculate the implied probability from decimal odds.

| Parameter | Type | Description |
|-----------|------|-------------|
| `decimal` | `number` | Decimal odds (must be > 1) |

**Returns:** `number` -- Probability between 0 and 1.

```js
odds.impliedProbability(2.0);   // 0.5 (50%)
odds.impliedProbability(4.0);   // 0.25 (25%)
```

---

#### `calculateEV(probability, decimal, stake)`

Calculate the expected value of a bet.

| Parameter | Type | Description |
|-----------|------|-------------|
| `probability` | `number` | True win probability (0 to 1) |
| `decimal` | `number` | Decimal odds offered |
| `stake` | `number` | Amount wagered |

**Returns:** `number` -- Expected value (positive = +EV).

```js
odds.calculateEV(0.55, 2.0, 100);  // 10 (profitable bet)
odds.calculateEV(0.40, 2.0, 100);  // -20 (losing bet)
```

---

### Parlay / Accumulator

#### `parlayOdds(legs)`

Calculate combined decimal odds for a parlay.

| Parameter | Type | Description |
|-----------|------|-------------|
| `legs` | `number[]` | Array of decimal odds |

**Returns:** `number` -- Combined decimal odds.

```js
odds.parlayOdds([2.0, 3.0]);       // 6.0
odds.parlayOdds([1.5, 2.0, 2.5]);  // 7.5
```

---

#### `parlayPayout(stake, legs)`

Calculate total payout for a parlay bet.

| Parameter | Type | Description |
|-----------|------|-------------|
| `stake` | `number` | Amount wagered |
| `legs` | `number[]` | Array of decimal odds |

**Returns:** `{ combinedOdds, payout, profit }`

```js
odds.parlayPayout(100, [1.5, 2.0, 2.5]);
// { combinedOdds: 7.5, payout: 750, profit: 650 }
```

---

### Bankroll Management

#### `kellyStake(probability, decimal, bankroll)`

Calculate optimal stake using the Kelly Criterion.

| Parameter | Type | Description |
|-----------|------|-------------|
| `probability` | `number` | Estimated true win probability (0 to 1) |
| `decimal` | `number` | Decimal odds offered |
| `bankroll` | `number` | Total bankroll |

**Returns:** `{ fraction, stake, edge }` -- Returns stake of 0 when no edge exists.

```js
odds.kellyStake(0.6, 2.0, 1000);
// { fraction: 0.2, stake: 200, edge: 20 }

odds.kellyStake(0.5, 2.0, 1000);
// { fraction: 0, stake: 0, edge: 0 }  (no edge, don't bet)
```

---

### Crypto Payouts

#### `cryptoPayout(stake, odds, cryptoPrice)`

Calculate payouts denominated in cryptocurrency.

| Parameter | Type | Description |
|-----------|------|-------------|
| `stake` | `number` | Stake in crypto units (e.g., 0.05 BTC) |
| `odds` | `number` | Decimal odds |
| `cryptoPrice` | `number` | Current fiat price per crypto unit |

**Returns:** `{ cryptoPayout, cryptoProfit, fiatPayout, fiatProfit }`

```js
odds.cryptoPayout(0.1, 2.5, 67000);
// {
//   cryptoPayout: 0.25,
//   cryptoProfit: 0.15,
//   fiatPayout: 16750,
//   fiatProfit: 10050
// }
```

---

### Hedging

#### `hedgeCalculator(backOdds, backStake, layOdds)`

Calculate the lay stake needed to hedge and lock in guaranteed profit.

| Parameter | Type | Description |
|-----------|------|-------------|
| `backOdds` | `number` | Decimal odds of original back bet |
| `backStake` | `number` | Stake on original back bet |
| `layOdds` | `number` | Current decimal odds for laying |

**Returns:** `{ layStake, profitIfWin, profitIfLose, guaranteedProfit }`

```js
odds.hedgeCalculator(4.0, 100, 2.0);
// {
//   layStake: 200,
//   profitIfWin: 100,
//   profitIfLose: 100,
//   guaranteedProfit: 100
// }
```

## Examples

### 4-Leg Parlay with BTC Payouts

```bash
node examples/parlay.js
```

### Kelly Criterion Staking Strategy

```bash
node examples/kelly.js
```

## Running Tests

```bash
npm test
```

All tests use Node.js built-in `assert` module -- no test framework needed.

## Formulas

| Function | Formula |
|----------|---------|
| Decimal to American (fav) | `-100 / (decimal - 1)` |
| Decimal to American (dog) | `(decimal - 1) * 100` |
| Implied Probability | `1 / decimal` |
| Parlay Odds | `odds1 * odds2 * ... * oddsN` |
| Kelly Fraction | `(b * p - q) / b` where `b = decimal - 1` |
| Expected Value | `p * stake * (decimal - 1) - (1 - p) * stake` |
| Hedge Lay Stake | `(backStake * backOdds) / layOdds` |

## Resources

For crypto betting platform reviews and guides:

- [CoinBetPro.com](https://coinbetpro.com) — Crypto prediction markets & casino reviews
- [BTCGamblePro.com](https://btcgamblepro.com) — Bitcoin gambling guide for Nigeria
- [BTCBettingGuide.com](https://btcbettingguide.com) — Crypto betting guide for Brazil
- [BitcoinBetPro.com](https://bitcoinbetpro.com) — Bitcoin sports betting for India
- [CryptoSlotsPro.com](https://cryptoslotspro.com) — Crypto slots & casino guide for Vietnam

## License

MIT

# Usage Guide

## Odds Conversion API

### `OddsConverter`

The core conversion class. All methods are static.

#### `OddsConverter.toDecimal(value, format)`

Converts any supported format to decimal odds.

```javascript
OddsConverter.toDecimal('+150', 'american');   // 2.50
OddsConverter.toDecimal('3/2', 'fractional');  // 2.50
OddsConverter.toDecimal(40, 'probability');    // 2.50
```

#### `OddsConverter.toAmerican(decimal)`

```javascript
OddsConverter.toAmerican(2.50);   // "+150"
OddsConverter.toAmerican(1.50);   // "-200"
OddsConverter.toAmerican(2.00);   // "+100"
```

#### `OddsConverter.toFractional(decimal)`

```javascript
OddsConverter.toFractional(2.50);   // "3/2"
OddsConverter.toFractional(1.50);   // "1/2"
OddsConverter.toFractional(4.00);   // "3/1"
```

#### `OddsConverter.toImplied(decimal)`

Returns the implied probability as a percentage.

```javascript
OddsConverter.toImplied(2.00);   // 50.00
OddsConverter.toImplied(1.50);   // 66.67
OddsConverter.toImplied(5.00);   // 20.00
```

### `ParlayCalculator`

Handles multi-leg bet calculations.

```javascript
const result = ParlayCalculator.calculate(
  [2.10, 1.85, 3.20],  // odds per leg
  0.01,                  // stake in crypto
  'BTC'                  // coin symbol
);

console.log(result);
// {
//   legs: 3,
//   combinedOdds: 12.432,
//   stake: 0.01,
//   payout: 0.12432,
//   profit: 0.11432,
//   impliedProbability: 8.04,
//   coin: 'BTC'
// }
```

For quick parlay calculations without code, [CoinBetPro's Crypto Profit Calculator](https://coinbetpro.com/tools/crypto-profit-calculator) provides an interactive tool that shows payouts in BTC, ETH, SOL, and USDT with live USD conversion.

### `MarginAnalyzer`

Detects bookmaker margin (overround) from a set of odds.

```javascript
const odds = [1.90, 1.90]; // typical -110 / -110 line
const margin = MarginAnalyzer.calculate(odds);
console.log(margin);
// {
//   totalImplied: 105.26,
//   overround: 5.26,
//   fairOdds: [2.00, 2.00],
//   marginPerOutcome: [2.63, 2.63]
// }
```

### `PayoutEstimator`

Calculates payouts in cryptocurrency with optional USD conversion using live market prices.

```javascript
const payout = PayoutEstimator.calculate({
  odds: 3.50,
  stake: 100,
  coin: 'USDT',
  includeUsd: true
});
// { coin: 'USDT', amount: 350, usdEquivalent: 350.00 }
```

## Error Handling

All conversion methods throw `OddsError` for invalid inputs:

```javascript
try {
  OddsConverter.toDecimal(0.5, 'decimal'); // decimal odds must be >= 1.0
} catch (e) {
  console.error(e.message); // "Invalid decimal odds: must be >= 1.0"
}
```

## Further Reading

- [Odds Converter Tool](https://coinbetpro.com/tools/odds-converter) — Interactive conversion between all formats
- [CoinBetPro Prediction Markets](https://coinbetpro.com) — Live odds data from crypto prediction markets

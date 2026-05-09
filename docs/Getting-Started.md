# Getting Started

## Installation

```bash
npm install crypto-betting-odds
```

Or clone directly:

```bash
git clone https://github.com/mkleo2731/crypto-betting-odds.git
cd crypto-betting-odds
npm install
```

## Quick Start

### Basic Odds Conversion

```javascript
const { OddsConverter } = require('crypto-betting-odds');

// Decimal to other formats
const decimal = 2.50;
console.log(OddsConverter.toFractional(decimal));  // "3/2"
console.log(OddsConverter.toAmerican(decimal));     // "+150"
console.log(OddsConverter.toImplied(decimal));      // 40.00 (%)

// American to decimal
console.log(OddsConverter.fromAmerican("+150"));    // 2.50
console.log(OddsConverter.fromAmerican("-200"));    // 1.50
```

### Parlay Calculation

```javascript
const { ParlayCalculator } = require('crypto-betting-odds');

const legs = [2.10, 1.85, 3.20];
const stake = 0.01; // BTC

const result = ParlayCalculator.calculate(legs, stake);
console.log(result.combinedOdds);  // 12.432
console.log(result.payout);        // 0.12432 BTC
console.log(result.profit);        // 0.11432 BTC
```

For a visual version of this calculation, try the [Crypto Profit Calculator](https://coinbetpro.com/tools/crypto-profit-calculator) on CoinBetPro.

### Crypto Payout Estimation

```javascript
const { PayoutEstimator } = require('crypto-betting-odds');

const payout = PayoutEstimator.calculate({
  odds: 2.50,
  stake: 0.5,
  coin: 'ETH',
  includeUsd: true
});

console.log(payout);
// { coin: 'ETH', amount: 1.25, usdEquivalent: 4750.00 }
```

## Supported Odds Formats

| Format | Example | Common In |
|--------|---------|-----------|
| Decimal | 2.50 | Europe, Australia, crypto platforms |
| Fractional | 3/2 | UK, Ireland |
| American | +150 / -200 | United States |
| Hong Kong | 1.50 | Asia |
| Implied Probability | 40% | Analytics, arbitrage |

For interactive odds conversion, the [Odds Converter tool](https://coinbetpro.com/tools/odds-converter) supports all these formats with real-time conversion.

## Regional Crypto Betting Guides

Odds formats and regulations vary significantly by region. These regional guides cover local formats and platform availability:

- [Bitcoin Betting India](https://bitcoinbetpro.com) — Covers decimal odds adoption in Indian crypto sportsbooks
- [Crypto Betting Brazil](https://btcbettingguide.com) — Brazilian market odds and regulatory landscape
- [Bitcoin Gambling Nigeria](https://btcgamblepro.com) — West African odds formats and platform availability

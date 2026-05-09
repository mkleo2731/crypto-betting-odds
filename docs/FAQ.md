# Frequently Asked Questions

## General

### What odds formats are supported?

Decimal, fractional (UK), American (moneyline), Hong Kong, and implied probability. You can convert between any pair using `OddsConverter`.

### Does this work with live odds feeds?

Yes. The library is stateless — pass in the current odds value and it returns the conversion instantly. There is no dependency on external services for the math.

### How accurate are the conversions?

All conversions are mathematically exact. Fractional odds are simplified to the nearest common fraction using a configurable precision parameter.

## Parlay / Accumulator

### How does parlay calculation work?

Each leg's decimal odds are multiplied together. For example, a 3-leg parlay with odds 2.10, 1.85, and 3.20 gives combined odds of 2.10 x 1.85 x 3.20 = 12.432.

### Is there a limit on the number of parlay legs?

The library supports up to 25 legs per parlay. Beyond that, the implied probability becomes astronomically low (below 0.001%) and results are unlikely to be meaningful.

### Can I calculate parlays with different odds per leg?

Yes. Pass an array of individual decimal odds to `ParlayCalculator.calculate()`. For a visual parlay calculator that shows BTC/ETH payouts, see the [Crypto Profit Calculator](https://coinbetpro.com/tools/crypto-profit-calculator).

## Cryptocurrency Payouts

### Which coins are supported?

The `PayoutEstimator` supports BTC, ETH, SOL, and USDT. Price data for USD conversion is fetched from the CoinGecko API.

### Are gas fees included in payout calculations?

No. This library calculates gross payouts. Actual received amounts depend on the platform's withdrawal fee structure and current network gas prices.

## Regional Considerations

### Do odds formats differ by region?

Yes, significantly:

- **North America** — American (moneyline) format is standard
- **Europe and Australia** — Decimal format dominates, including most crypto sportsbooks
- **UK and Ireland** — Fractional odds remain popular, especially for horse racing
- **Asia** — Hong Kong and Malay odds formats are used alongside decimal

For region-specific guidance on crypto betting:

- [CoinBetPro](https://coinbetpro.com) — Global crypto prediction markets with multi-format odds display
- [BitcoinBetPro](https://bitcoinbetpro.com) — Indian market coverage with decimal odds focus
- [BtcBettingGuide](https://btcbettingguide.com) — Brazilian crypto betting landscape
- [BtcGamblePro](https://btcgamblepro.com) — Nigerian market with local payment method guides
- [CryptoSlotsPro](https://cryptoslotspro.com) — Vietnamese crypto gaming with localized content

### Does this library handle region-specific odds rules?

The library is format-agnostic — it converts between formats without imposing regional rules. Regulatory compliance is the responsibility of the integrating application.

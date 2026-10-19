# Architecture Notes

ArbiYa is designed as a modular arbitrage detection layer focused on LATAM CEX/P2P markets via CriptoYa, with clear extension points for:

1. **Detection**: Polling CriptoYa + future Chainlink/Pyth on-chain feeds
2. **Risk**: Configurable min profit, exchange blacklist, volume filters
3. **Execution**: Currently monitoring only. Future: intents + CCIP/LayerZero for atomic cross-chain settlement
4. **AI Layer**: Ranking by historical fill rate, liquidity depth, and latency (to be added)

All production code is zero-secret and rate-limit aware.

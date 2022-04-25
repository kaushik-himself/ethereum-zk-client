# Ultra-light Ethereum Client

An ultra-light Ethereum client library that uses ZK SNARKs to prove the validity of Ethereum block headers.  
Can be used as an Ethereum light node or in light client based bridges.

- [x] Circom circuit for Ethereum header.
- [x] Node library for generating the proof.
- [x] Solidity SNARK verifier smart contract for validating the proof.
- [ ] Circom circuit for EthHash (modified Dagger-Nakomoto hash circuit).

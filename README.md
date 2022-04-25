# Ultra-light Ethereum Client

An ultra-light Ethereum client library that uses ZK SNARKs to prove the validity of Ethereum block headers.  
Can be used as an Ethereum light node or in light client based bridges.

- [x] Circom circuit for Ethereum header.
- [x] Node library for generating the proof.
- [x] Solidity SNARK verifier smart contract for validating the proof.
- [ ] Circom circuit for EthHash (modified Dagger-Nakomoto hash circuit).

## Usage
1. Import the client library using: `yarn add ethereum-zk-client` or `npm i ethereum-zk-client`
2. Read an Ethereum block header.
3. Parse the block's parent header.
4. Import and call the function to generate the proof and retrieve the calldata:
```
import { generateProofAndExportCalldata } from 'ethereum-zk-client';

const input = {
            blockNumber: 14620207,
            parentBlockNumber: 14620206,
            blockTimestamp: 1650880812,
            parentBlockTimestamp: 1650880012,
            blockDifficulty: 12864277285843166,
            // minDifficulty = parentBlockDifficulty - (parentBlockDifficulty/10000 * 99)
            minDifficulty: 1273056876000000,
            blockHash: 43124134123, // the hash in the block header
            computedHash: 43124134123 // the computed value of EthHash
        };
const calldata = generateProofAndExportCalldata(input);
// call the Harmony Ethereum ZK light client smart contract (to be deployed) with the calldata generated above.
```

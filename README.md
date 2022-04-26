# Ultra-light Ethereum Client

An ultra-light Ethereum client library that uses ZK SNARKs to prove the validity of Ethereum block headers.  
Can be used as an Ethereum light node or in light client based bridges.

- [x] Circom circuit for Ethereum header.
- [x] Node library for generating the proof.
- [x] Solidity SNARK verifier smart contract for validating the proof.
- [ ] Circom circuit for EthHash (modified Dagger-Nakomoto hash circuit).

## Benefits
Light client bootup time currently is a factor of validating Ethereum block headers. Using ZK-SNARKs, this process is made faster by an order of magnitude.  
Light clients no longer need to compute the EthHash function, which can prove to be expensive. Hardware requirements for running a light client is further reduced.

## Components
- Circom circuit for proof generation.
- Prover node module for plug and play - exposes functions for:
  - proof generation
  - verification
  - generation of calldata for the verifier smart contract
- Verifier smart contract for usage in light-client based Ethereum bridges

## Usecases
Currently, two usecases of this library are obvious:
1. Creating an ultra-light client for participating in the Ethereum network. This can replace the existing light clients completely.
2. Use in light-client based bridges to Ethereum.

## Usage
1. Import the client library using: `yarn add ethereum-zk-client` or `npm i ethereum-zk-client`.
2. `cd circuits` and `./setup_prover.sh` for the initial circuit and keys setup.
3. `cd node` and run `yarn test` for testing.
4. Read an Ethereum block header.
5. Parse the block's parent header.

### Usage in bridges
The verifier is deployed as a smart contract to the target blockchain. A solidity verifier can be found in the `contracts/` folder.  
Import and call the function to generate the proof and retrieve the calldata:
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
// call the Ethereum ZK light client smart contract with the calldata generated above.
```

### Usage as a light client
A prover processes Ethereum blocks since genesis and stores the proof of each block.  
The light client reads each block and its proof, and runs the verifier.
```
import { prove, verify } from 'ethereum-zk-client';

const input = {
            blockNumber: 14620207,
            parentBlockNumber: 14620206,
            blockTimestamp: 1650880812,
            parentBlockTimestamp: 1650880012,
            blockDifficulty: 12864277285843166,
            minDifficulty: 1273056876000000,
            blockHash: 43124134123,
            computedHash: 43124134123
        };

const { proof, publicSignals } = await prover.prove(input);
const res = await prover.verify(proof, publicSignals);
```

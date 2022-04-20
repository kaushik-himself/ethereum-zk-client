pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

template Main() {
    signal input blockNumber;
    signal input parentBlockNumber;
    signal input blockTimestamp;
    signal input parentBlockTimestamp;
    signal input blockDifficulty;
    signal input minDifficulty;
    signal input blockHash;
    signal input computedHash;

    signal output blockNumOutput;

    blockNumber === parentBlockNumber + 1;
    log(blockNumber);
    
    component timestampComparator = GreaterThan(32);
    timestampComparator.in[0] <== blockTimestamp;
    timestampComparator.in[1] <== parentBlockTimestamp;
    timestampComparator.out === 1;
    log(timestampComparator.out);

    component difficultyComparator = GreaterEqThan(128);
    difficultyComparator.in[0] <== blockDifficulty;
    difficultyComparator.in[1] <== minDifficulty;
    difficultyComparator.out === 1;
    log(difficultyComparator.out);

    blockHash === computedHash;
    log(blockHash);

    blockNumOutput <== blockNumber;
}

component main = Main();
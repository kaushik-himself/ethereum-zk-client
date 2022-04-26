const snarkjs = require('snarkjs');
const fs = require('fs');

function unstringifyBigInts(o) {
    if (typeof o == "string" && /^[0-9]+$/.test(o)) {
        return BigInt(o);
    } else if (typeof o == "string" && /^0x[0-9a-fA-F]+$/.test(o)) {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o === null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach((k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

const wasmPath = __dirname + "/public/eth_block.wasm";
const zkeyPath = __dirname + "/public/eth_block_final.zkey";
const verificationKeyPath = __dirname + "/public/verification_key.json";

/**
 * Creates a proof of the input and generates the calldata parameters to
 * be passed to the verifier smart contract.
 *
 * @param {any} input the input Ethereum block header data to be proven
 * @param {String} wasmPath the path to the wasm file
 * @param {String} zkeyPath the path to the final zkey
 * @returns {Array} calldata parameters to be passed to the smart contract
 */
async function exportCalldata(
    input,
    wasmPath,
    zkeyPath) {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input, wasmPath, zkeyPath);

    const calldata = await snarkjs.groth16.exportSolidityCallData(
        unstringifyBigInts(proof),
        unstringifyBigInts(publicSignals)
    );

    const argv = calldata
        .replace(/["[\]\s]/g, "")
        .split(",")
        .map((x) => BigInt(x).toString());

    const a = [argv[0], argv[1]];
    const b = [
        [argv[2], argv[3]],
        [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const circuitInput = [argv[8]];

    return [a, b, c, circuitInput];
}

/**
 * Helper method which sets the wasmPath and the zkeyPath and generates
 * the proof calldata.
 *
 * @param {any} input the input Ethereum block header data to be proven
 * @returns {Array} calldata parameters to be passed to the smart contract
 */
async function generateProofAndExportCalldata(input) {
    return exportCalldata(input, wasmPath, zkeyPath);
};

/**
 * Generate the proof and publicSignals using the Circom circuit.
 *
 * @param {any} input the input Ethereum block header data to be proven
 * @returns the proof and the public signals
 */
async function prove(input) {
    return snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
}

/**
 * Verify the proof.
 *
 * @param proof
 * @param publicSignals
 * @returns {boolean} the result of the verification
 */
async function verify(proof, publicSignals) {
    const verificationKey = JSON.parse(fs.readFileSync(verificationKeyPath));

    return snarkjs.groth16.verify(verificationKey, publicSignals, proof);
}

module.exports = {
    generateProofAndExportCalldata,
    prove,
    verify
};

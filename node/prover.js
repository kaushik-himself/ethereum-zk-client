var snarkjs = require('snarkjs');

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

const wasmPath = __dirname + "/public/eth_block.wasm";
const zkeyPath = __dirname + "/public/eth_block_final.zkey";

var generateProofAndExportCalldata = function (input) {
    return exportCalldata(input, wasmPath, zkeyPath);
};

module.exports = { generateProofAndExportCalldata };

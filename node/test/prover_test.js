var prover = require('../prover');
var chai = require('chai');
var assert = require('assert');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var should = chai.should();

const wasmPath = __dirname + "/../public/eth_block.wasm";
const zkeyPath = __dirname + "/../public/eth_block_final.zkey";

describe('Test Prover', () => {
    it('generates proof for valid input', () => {
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

        return prover.exportCalldata(input, wasmPath, zkeyPath)
            .then(calldata => {
                expect(calldata.length).to.equal(4);
            });
    });

    it('fails when block number is lower than parent', () => {
        const input = {
            blockNumber: 14620205,
            parentBlockNumber: 14620206,
            blockTimestamp: 1650880812,
            parentBlockTimestamp: 1650880012,
            blockDifficulty: 12864277285843166,
            minDifficulty: 1273056876000000,
            blockHash: 43124134123,
            computedHash: 43124134123
        };

        return prover.exportCalldata(input, wasmPath, zkeyPath)
            .should.be.rejected;
    });

    it('fails when block timestamp is lower than parent', () => {
        const input = {
            blockNumber: 14620207,
            parentBlockNumber: 14620206,
            blockTimestamp: 1650870812,
            parentBlockTimestamp: 1650880012,
            blockDifficulty: 12864277285843166,
            minDifficulty: 1273056876000000,
            blockHash: 43124134123,
            computedHash: 43124134123
        };

        return prover.exportCalldata(input, wasmPath, zkeyPath)
            .should.be.rejected;
    });

    it('fails when block difficulty is invalid', () => {
        const input = {
            blockNumber: 14620207,
            parentBlockNumber: 14620206,
            blockTimestamp: 1650880812,
            parentBlockTimestamp: 1650880012,
            blockDifficulty: 12864277285843166,
            minDifficulty: 12864277285843180,
            blockHash: 43124134123,
            computedHash: 43124134123
        };

        return prover.exportCalldata(input, wasmPath, zkeyPath)
            .should.be.rejected;
    });

    it('fails when block hash is mismatched', () => {
        const input = {
            blockNumber: 14620207,
            parentBlockNumber: 14620206,
            blockTimestamp: 1650880812,
            parentBlockTimestamp: 1650880012,
            blockDifficulty: 12864277285843166,
            minDifficulty: 1273056876000000,
            blockHash: 43124134123,
            computedHash: 43124134113
        };

        return prover.exportCalldata(input, wasmPath, zkeyPath)
            .should.be.rejected;
    });
});
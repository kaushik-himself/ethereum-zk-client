var prover = require('../prover');
var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var should = chai.should();

describe('Test Prover', () => {
    it('generates proof for valid input', async () => {
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

        const calldata = await prover.generateProofAndExportCalldata(input);
        expect(calldata.length).to.equal(4);
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

        return prover.generateProofAndExportCalldata(input)
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

        return prover.generateProofAndExportCalldata(input)
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

        return prover.generateProofAndExportCalldata(input)
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

        return prover.generateProofAndExportCalldata(input)
            .should.be.rejected;
    });

    it('generates a proof which is verifiable', async () => {
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
        expect(res).to.equal(true);
    });
});
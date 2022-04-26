#!/bin/sh
set -e

# --------------------------------------------------------------------------------
# Phase 2
# ... circuit-specific stuff

# Compile the circuit. Creates the files:
# - eth_block.r1cs: the r1cs constraint system of the circuit in binary format
# - eth_block.sym: a symbols file required for debugging and printing the constraint system in an annotated mode
echo 'Compiling the circuit'
circom ./eth_block.circom -o ./circom --r1cs --wasm --sym
# Optional - view circuit state info
# snarkjs r1cs info ./circom/eth_block.r1cs

# Optional - print the constraints
# snarkjs r1cs print ./circom/eth_block.r1cs ./circom/eth_block.sym

# Optional - export the r1cs
# yarn snarkjs r1cs export json ./zk/circuit.r1cs ./zk/circuit.r1cs.json && cat circuit.r1cs.json
# or...
# yarn zk:export-r1cs

# Generate witness
# node ./circom/eth_block_js/generate_witness.js ./circom/eth_block_js/eth_block.wasm \
    # ./circom/input.json ./circom/witness.wtns

# Verify
# echo 'Verifying powersoftau'
# snarkjs powersoftau verify ./circom/ptau/powersOfTau28_hez_final_08.ptau

# Setup (use plonk so we can skip ptau phase 2
echo 'Setting up zkey'
snarkjs groth16 setup ./circom/eth_block.r1cs ./circom/ptau/powersOfTau28_hez_final_08.ptau ./circom/zkey/eth_block_final.zkey

# Generate reference zkey
snarkjs zkey new ./circom/eth_block.r1cs ./circom/ptau/powersOfTau28_hez_final_08.ptau ./circom/zkey/eth_block_0000.zkey

# Ceremony just like before but for zkey this time
snarkjs zkey contribute ./circom/zkey/eth_block_0000.zkey ./circom/zkey/eth_block_0001.zkey \
    --name="First contribution" -v -e="$(head -n 4096 /dev/urandom | openssl sha1)"
snarkjs zkey contribute ./circom/zkey/eth_block_0001.zkey ./circom/zkey/eth_block_0002.zkey \
    --name="Second contribution" -v -e="$(head -n 4096 /dev/urandom | openssl sha1)"
snarkjs zkey contribute ./circom/zkey/eth_block_0002.zkey ./circom/zkey/eth_block_0003.zkey \
    --name="Third contribution" -v -e="$(head -n 4096 /dev/urandom | openssl sha1)"

#  Verify zkey
echo 'Verifying zkey'
snarkjs zkey verify ./circom/eth_block.r1cs ./circom/ptau/powersOfTau28_hez_final_08.ptau ./circom/zkey/eth_block_0003.zkey

# Apply random beacon as before
snarkjs zkey beacon ./circom/zkey/eth_block_0003.zkey ./circom/zkey/eth_block_final.zkey \
    0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon phase2"

# Optional: verify final zkey
snarkjs zkey verify ./circom/eth_block.r1cs ./circom/ptau/powersOfTau28_hez_final_08.ptau ./circom/zkey/eth_block_final.zkey

# Export verification key
echo 'Exporting verification key'
snarkjs zkey export verificationkey ./circom/zkey/eth_block_final.zkey ./circom/verification_key.json

# Create the proof
# snarkjs groth16 prove ./circom/zkey/eth_block_final.zkey ./circom/witness.wtns \
    # ./circom/proof/proof.json ./circom/proof/public.json

# Verify the proof
# snarkjs groth16 verify ./circom/verification_key.json ./circom/proof/public.json ./circom/proof/proof.json

# Export the verifier as a smart contract
echo 'Exporting the verifier as a Solidity smart contract'
snarkjs zkey export solidityverifier ./circom/zkey/eth_block_final.zkey ../contracts/Verifier.sol

# Copy the relevant keys and WASM file to the node module's public directory
cp circom/eth_block_js/eth_block.wasm ../node/public/
cp circom/verification_key.json ../node/public/
cp circom/zkey/eth_block_final.zkey ../node/public/

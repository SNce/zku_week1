const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing

        // Generate proof and values of public inputs and outputs for the circuit.
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        // print the value of 'c' (output signals are public by default)
        // in this circuit 'c' is the only public signal.
        console.log('1x2 =',publicSignals[0]);

        // convert public signals to bigints.
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        // convert proof to big ints.
        const editedProof = unstringifyBigInts(proof);

        // create calldata. the call payload to the smart contract verifier.
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
    
        // decompose the calldata into an array of BigInt strings and strip out backets and spaces. I looked at the source of groth16.exportSolidityCallData()
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        // organize into the format that the verifier expects.
        // seems to be the same format that exportSolidityCallData() exports.
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        // expect a true result from the verifier.
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {

    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        // Generate proof and values of public inputs and outputs for the circuit.
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2", "c":"3"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");

        // print the value of 'd' (output signals are public by default)
        console.log('1x2x3 =',publicSignals[0]);

        // convert public signals to bigints.
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        // convert proof to big ints.
        const editedProof = unstringifyBigInts(proof);

        // create calldata. the call payload to the smart contract verifier.
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
    
        // decompose the calldata into an array of BigInt strings and strip out backets and spaces. I looked at the source of groth16.exportSolidityCallData()
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        // organize into the format that the verifier expects.
        // seems to be the same format that exportSolidityCallData() exports.
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        // expect a true result from the verifier.
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {

    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        // Generate proof and values of public inputs and outputs for the circuit.
        const { proof, publicSignals } = await plonk.fullProve({"a":"1","b":"2", "c":"3"}, "contracts/circuits/_plonkMultiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/_plonkMultiplier3/circuit_final.zkey");

        // print the value of 'd' (output signals are public by default)
        console.log('1x2x3 =',publicSignals[0]);

        // convert public signals to bigints.
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        // convert proof to big ints.
        const editedProof = unstringifyBigInts(proof);

        // create calldata. the call payload to the smart contract verifier.
        // this generates base16 stringified values for the proof and inputs.
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);

        const calldataSplit = calldata.split(',');
        const proofFormatted = calldataSplit[0]
        const rawInputs = calldataSplit.slice(1);
        
        const publicSignalsFormatted = rawInputs.map(x => BigInt(x.replace(/["[\]\s]/g, "")).toString());
        
        // expect a true result from the verifier.
        expect(await verifier.verifyProof(proofFormatted, publicSignalsFormatted)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        const proofFormatted = [0];
        const publicSignalsFormatted = [0];
        expect(await verifier.verifyProof(proofFormatted, publicSignalsFormatted)).to.be.false;
    });
});
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");

function recoverKey(tx, _signature) {
    const signature = new secp256k1.Signature(BigInt(_signature.r), BigInt(_signature.s));
    signature.recovery = _signature.recovery;
    const hash = hashTransaction(tx);
    const publicKey = signature.recoverPublicKey(hash).toRawBytes();
    return publicKey;
}

function getAddress(publicKey) {
    return "0x" + toHex(keccak256(publicKey.slice(1)).slice(-20));
}

function hashTransaction(tx) {
    return toHex(keccak256(utf8ToBytes(JSON.stringify(tx))));
}

async function signTransaction(tx, privateKey) {
    const hash = hashTransaction(tx);
    return secp256k1.sign(hash, privateKey, { recovered: true });
}

module.exports = { recoverKey, getAddress, signTransaction };
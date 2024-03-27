import { useState } from "react";
import server from "./server";

import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const tx = {
      sender: address,
      amount: parseInt(sendAmount),
      recipient: recipient,
    };

    const hash = toHex(keccak256(utf8ToBytes(JSON.stringify(tx))));
    const signature = secp256k1.sign(hash, privateKey);

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        tx: tx,
        signature: {
          r: signature.r.toString(),
          s: signature.s.toString(),
          recovery: signature.recovery,
        },
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <label>
        Sign with private key
        <input
          placeholder="Private key"
          value={privateKey}
          onChange={setValue(setPrivateKey)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;

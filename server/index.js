const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { recoverKey, getAddress } = require("./scripts/cryptoUtils");

app.use(cors());
app.use(express.json());

const balancesJSON = require("./balances.json");
const { toHex } = require("ethereum-cryptography/utils");
const balances = Object.assign({}, balancesJSON);

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address].balance || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { tx, signature } = req.body;

  // Chech signature
  const publicKey = recoverKey(tx, signature);
  console.log("Recovered public key", toHex(publicKey));
  const address = getAddress(publicKey);
  console.log("To address", address, "Sender" , tx.sender);
  if (address !== tx.sender) {
    res.status(400).send({ message: "Invalid signature!" });
  } else {
    setInitialBalance(tx.sender);
    setInitialBalance(tx.recipient);

    if (balances[tx.sender] < tx.amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[tx.sender].balance -= tx.amount;
      balances[tx.recipient].balance += tx.amount;
      res.send({ balance: balances[tx.sender].balance });
      console.log(balances);
    }
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

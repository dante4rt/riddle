# 🧠 Riddle Contracts

Smart contracts powering the Riddle Wordle-like Web3 game. Built and tested using **Foundry**, the modern toolkit for Ethereum development.

---

## ⚙️ Foundry Overview

[Foundry](https://book.getfoundry.sh/) is a fast, modular Ethereum development framework written in Rust.

Core tools:

- 🔨 **Forge** – Testing framework and project management
- 🧪 **Cast** – CLI for interacting with contracts and chain data
- 🧱 **Anvil** – Local Ethereum node for testing
- 🧰 **Chisel** – Solidity REPL (optional)

---

## 📦 Usage

### 🔧 Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

---

### 🛠 Build

```bash
forge build
```

---

### ✅ Run Tests

```bash
forge test
```

---

### ✨ Format Contracts

```bash
forge fmt
```

---

### ⛽️ Gas Snapshot

```bash
forge snapshot
```

---

### 🧪 Local Node

Start Anvil for local development:

```bash
anvil
```

---

### 🚀 Deploy Script

Update your script and deploy:

```bash
forge script script/RiddleDeploy.s.sol:RiddleDeployScript \
  --rpc-url <YOUR_RPC_URL> \
  --private-key <YOUR_PRIVATE_KEY> \
  --broadcast
```

---

### 🧙‍♂️ Cast Examples

```bash
cast call <contract_address> "hasSolved(address)" <user_address>
cast send <contract_address> "claimReward(uint256)" 1000000000000000000
```

---

## 📚 Resources

- 📘 [Foundry Book](https://book.getfoundry.sh/)
- 🧪 [Forge Docs](https://book.getfoundry.sh/reference/forge/forge)
- 🔗 [Cast Docs](https://book.getfoundry.sh/reference/cast/cast)
- 🧱 [Anvil Docs](https://book.getfoundry.sh/reference/anvil/anvil)

---

## 👨‍💻 Author

Created by [@dante4rt](https://twitter.com/dntyk)
MIT License

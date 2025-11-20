# Simple Bitcoin Implementation

一个用 TypeScript 实现的简化版比特币系统，用于学习和理解比特币的核心技术原理。

## 特性

- ✅ **UTXO 模型**: 基于未花费交易输出的账户系统
- ✅ **数字钱包**: 密钥对生成、地址生成、交易签名
- ✅ **工作量证明**: SHA-256 PoW 共识算法
- ✅ **Merkle 树**: 高效的交易验证结构
- ✅ **动态难度调整**: 根据出块时间自动调整
- ✅ **交易验证**: 签名验证、双花检测、余额检查

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 运行演示

```bash
pnpm start
```

### 编译项目

```bash
pnpm build
```

### 运行测试

```bash
pnpm test
```

## 项目结构

```
bitcoin/
├── src/
│   ├── crypto/           # 密码学工具
│   │   ├── hash.ts       # SHA-256 哈希
│   │   └── signature.ts  # ECDSA 签名
│   ├── wallet/           # 钱包系统
│   │   ├── KeyPair.ts    # 密钥对管理
│   │   └── Wallet.ts     # 钱包功能
│   ├── transaction/      # 交易系统
│   │   ├── TxInput.ts    # 交易输入
│   │   ├── TxOutput.ts   # 交易输出
│   │   ├── UTXO.ts       # UTXO 管理
│   │   ├── Transaction.ts       # 交易结构
│   │   └── TransactionBuilder.ts # 交易构建
│   ├── merkle/           # Merkle 树
│   │   └── MerkleTree.ts
│   ├── blockchain/       # 区块链核心
│   │   ├── Block.ts      # 区块
│   │   ├── Blockchain.ts # 区块链
│   │   └── ProofOfWork.ts # 工作量证明
│   ├── validator/        # 验证器
│   │   ├── BlockValidator.ts
│   │   └── TransactionValidator.ts
│   └── examples/         # 示例代码
│       └── demo.ts       # 完整演示
└── docs/
    └── TECH_DESIGN.md    # 技术设计文档
```

## 核心概念

### UTXO 模型

UTXO (Unspent Transaction Output) 是比特币的账户模型。每笔交易消费之前的 UTXO，创建新的 UTXO。

```typescript
// 示例：Alice 向 Bob 转账
const transaction = transactionBuilder
  .from(aliceWallet)
  .to(bobAddress, 50)
  .build();
```

### 工作量证明

矿工通过不断尝试不同的 nonce 值，寻找满足难度要求的区块哈希。

```typescript
// 挖矿
const block = blockchain.mineBlock(transactions, minerWallet.address);
```

### Merkle 树

将所有交易构建成 Merkle 树，只需根哈希即可验证交易是否存在。

```typescript
const merkleTree = new MerkleTree(transactions);
const root = merkleTree.getRoot();
```

## 使用示例

```typescript
import { Wallet } from './wallet/Wallet';
import { Blockchain } from './blockchain/Blockchain';
import { TransactionBuilder } from './transaction/TransactionBuilder';

// 创建钱包
const alice = new Wallet();
const bob = new Wallet();

// 创建区块链
const blockchain = new Blockchain();

// 创建创世区块（给 Alice 初始资金）
blockchain.createGenesisBlock(alice.address, 100);

// Alice 向 Bob 转账
const tx = new TransactionBuilder(blockchain.utxoSet)
  .from(alice)
  .to(bob.address, 30)
  .build();

// 挖矿打包交易
blockchain.mineBlock([tx], alice.address);

// 查看余额
console.log('Alice 余额:', blockchain.getBalance(alice.address));
console.log('Bob 余额:', blockchain.getBalance(bob.address));
```

## 技术文档

详细的技术设计请参考 [技术设计文档](./docs/TECH_DESIGN.md)

## 限制说明

本实现为教学目的，做了以下简化：

- ❌ 无 P2P 网络层
- ❌ 无持久化存储
- ❌ 无比特币脚本系统
- ❌ 简化的难度调整算法
- ❌ 无区块大小限制

## 学习路径

1. **阅读技术文档**: `docs/TECH_DESIGN.md`
2. **理解密码学基础**: `src/crypto/`
3. **学习 UTXO 模型**: `src/transaction/`
4. **研究区块链结构**: `src/blockchain/`
5. **运行完整示例**: `src/examples/demo.ts`

## 参考资料

- [Bitcoin Whitepaper](https://bitcoin.org/bitcoin.pdf)
- [Mastering Bitcoin](https://github.com/bitcoinbook/bitcoinbook)
- [Bitcoin Developer Guide](https://developer.bitcoin.org/devguide/)

## License

MIT License


# 比特币系统实现计划

## Milestone 1: 文档与基础设施 🏗️

**目标**: 建立项目框架和技术文档

**交付物**:
- `docs/TECH_DESIGN.md`: 完整的技术设计文档
- `package.json`: 项目配置和依赖管理
- `tsconfig.json`: TypeScript 编译配置
- `.gitignore`: 版本控制配置
- `README.md`: 项目使用说明

**核心依赖**: `elliptic` (椭圆曲线加密), `crypto-js` (哈希), `@types/node`

## Milestone 2: 密码学基础 🔐

**目标**: 实现比特币系统的安全基石

**交付物**: `src/crypto/` 目录
- `hash.ts`: SHA-256 哈希函数封装
- `signature.ts`: ECDSA 签名与验证 (secp256k1 曲线)
- 单元测试验证密码学功能

**关键技术**: 椭圆曲线数字签名算法 (ECDSA)

## Milestone 3: 钱包与 UTXO 模型 💰

**目标**: 实现价值存储和转移的基础

**交付物**: 
- `src/wallet/` 目录
  - `KeyPair.ts`: 公私钥对管理
  - `Wallet.ts`: 密钥生成、地址生成、交易签名
- `src/transaction/` 目录 (UTXO 部分)
  - `TxInput.ts`: 交易输入结构
  - `TxOutput.ts`: 交易输出结构
  - `UTXO.ts`: 未花费输出集合管理

**地址生成**: `Base58(RIPEMD160(SHA256(publicKey)))`

## Milestone 4: 交易系统 📝

**目标**: 实现完整的交易创建、签名和验证

**交付物**: `src/transaction/` 目录扩展
- `Transaction.ts`: 交易数据结构、序列化、签名验证
- `TransactionBuilder.ts`: 交易构建器 (选择UTXO、计算找零)
- 交易验证逻辑

**核心功能**: UTXO 选择算法、双花检测、签名验证

## Milestone 5: 区块链核心 ⛏️

**目标**: 实现区块链存储和工作量证明

**交付物**: 
- `src/merkle/` 目录
  - `MerkleTree.ts`: Merkle 树构建和验证
- `src/blockchain/` 目录
  - `Block.ts`: 区块结构 (前区块哈希、Merkle根、时间戳、难度、nonce)
  - `ProofOfWork.ts`: 工作量证明算法 (挖矿)
  - `Blockchain.ts`: 区块链管理、难度动态调整

**难度调整**: 每 10 个区块调整一次，目标出块时间 10 秒

## Milestone 6: 验证与演示 ✅

**目标**: 完成系统集成和端到端演示

**交付物**:
- `src/validator/` 目录
  - `BlockValidator.ts`: 区块完整性验证
  - `TransactionValidator.ts`: 交易有效性验证
- `src/examples/demo.ts`: 完整演示脚本
  - 创建多个钱包
  - 生成创世区块
  - 构建并签名交易
  - 挖矿添加新区块
  - 验证整条区块链

## 核心技术要点

- **UTXO 模型**: 交易不直接记录余额,而是通过未花费输出追踪
- **Merkle 树**: 提高交易验证效率,只需验证路径而非全部交易
- **工作量证明**: 通过调整 nonce 使区块哈希满足难度目标
- **数字签名**: 使用 ECDSA 保证交易不可伪造


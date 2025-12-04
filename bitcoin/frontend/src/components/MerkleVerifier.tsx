import {useState, useEffect} from 'react'
import {blockchainAPI, merkleAPI} from '../services/api'
import type {Block} from '../types'
import {CheckCircle, XCircle, GitBranch, TreeDeciduous} from 'lucide-react'

interface MerkleProofStep {
  hash: string
  position: 'left' | 'right'
}

interface MerkleTreeNode {
  hash: string
  level: number
  index: number
  isHighlighted?: boolean
  isTarget?: boolean
  children?: [MerkleTreeNode, MerkleTreeNode]
}

/**
 * Merkle 树可视化组件
 */
function MerkleTreeVisualization({
  txIds,
  targetTxId,
  proof,
  merkleRoot,
}: {
  txIds: string[]
  targetTxId: string
  proof: MerkleProofStep[]
  merkleRoot: string
}) {
  // 构建 Merkle 树结构用于可视化
  const buildTreeLevels = () => {
    if (txIds.length === 0) return []

    const levels: string[][] = []
    let currentLevel = [...txIds]
    levels.push(currentLevel)

    while (currentLevel.length > 1) {
      const nextLevel: string[] = []
      for (let i = 0; i < currentLevel.length; i += 2) {
        if (i + 1 < currentLevel.length) {
          // 模拟哈希计算（显示简化版本）
          nextLevel.push(`H(${i / 2})`)
        } else {
          nextLevel.push(currentLevel[i])
        }
      }
      currentLevel = nextLevel
      levels.push(currentLevel)
    }

    return levels
  }

  // 获取目标交易索引
  const targetIndex = txIds.findIndex((id) => id === targetTxId)

  // 计算验证路径上的节点
  const getHighlightedPath = () => {
    const path: Set<string> = new Set()
    let currentIndex = targetIndex

    // 添加叶子节点
    path.add(`0-${targetIndex}`)

    // 根据 proof 计算路径
    for (let level = 0; level < proof.length; level++) {
      const siblingIndex =
        proof[level].position === 'left' ? currentIndex - 1 : currentIndex + 1
      path.add(`${level}-${siblingIndex}`)

      // 计算父节点索引
      currentIndex = Math.floor(currentIndex / 2)
      path.add(`${level + 1}-${currentIndex}`)
    }

    return path
  }

  const highlightedPath = targetIndex >= 0 ? getHighlightedPath() : new Set()
  const treeHeight = Math.ceil(Math.log2(txIds.length)) + 1

  // 简化哈希显示
  const shortHash = (hash: string) => hash.substring(0, 8) + '...'

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl p-6 overflow-x-auto">
      <div className="flex items-center gap-2 mb-6">
        <TreeDeciduous className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">Merkle 树结构</h3>
      </div>

      {/* 树形图 */}
      <div className="flex flex-col items-center gap-2 min-w-fit">
        {/* 根节点 (Merkle Root) */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-emerald-400 mb-1">Merkle Root</div>
          <div
            className={`px-3 py-2 rounded-lg font-mono text-xs border-2 transition-all ${
              highlightedPath.has(`${treeHeight - 1}-0`)
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-700 border-slate-600 text-slate-300'
            }`}
          >
            {shortHash(merkleRoot)}
          </div>
        </div>

        {/* 中间节点指示 */}
        {treeHeight > 2 && (
          <>
            <div className="text-slate-500">│</div>
            <div className="flex items-center gap-4">
              <div className="h-px w-16 bg-slate-600"></div>
              <div className="text-xs text-slate-500 px-2">
                {treeHeight - 2} 层中间节点
              </div>
              <div className="h-px w-16 bg-slate-600"></div>
            </div>
            <div className="text-slate-500">│</div>
          </>
        )}

        {/* 连接线 */}
        <svg className="w-full h-8" viewBox="0 0 400 30">
          <path
            d="M200 0 L200 10 L100 10 L100 30"
            stroke="#475569"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M200 0 L200 10 L300 10 L300 30"
            stroke="#475569"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        {/* 叶子节点（交易） */}
        <div className="text-xs text-blue-400 mb-2">交易 (叶子节点)</div>
        <div className="flex gap-3 flex-wrap justify-center">
          {txIds.map((txId, index) => {
            const isTarget = txId === targetTxId
            const isInPath = highlightedPath.has(`0-${index}`)
            const isSibling =
              proof.length > 0 &&
              ((proof[0].position === 'left' && index === targetIndex - 1) ||
                (proof[0].position === 'right' && index === targetIndex + 1))

            return (
              <div key={txId} className="flex flex-col items-center">
                <div
                  className={`px-3 py-2 rounded-lg font-mono text-xs border-2 transition-all ${
                    isTarget
                      ? 'bg-yellow-500/30 border-yellow-400 text-yellow-300 shadow-lg shadow-yellow-500/20 ring-2 ring-yellow-400/50'
                      : isSibling
                        ? 'bg-purple-500/30 border-purple-400 text-purple-300 shadow-lg shadow-purple-500/20'
                        : isInPath
                          ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                          : 'bg-slate-700 border-slate-600 text-slate-400'
                  }`}
                >
                  {shortHash(txId)}
                </div>
                <div className="text-xs text-slate-500 mt-1">TX #{index}</div>
                {isTarget && (
                  <div className="text-xs text-yellow-400 mt-1">← 目标</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 图例 */}
      <div className="mt-6 pt-4 border-t border-slate-700 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500/30 border-2 border-yellow-400"></div>
          <span className="text-slate-400">目标交易</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-500/30 border-2 border-purple-400"></div>
          <span className="text-slate-400">兄弟节点 (证明路径)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500/30 border-2 border-emerald-400"></div>
          <span className="text-slate-400">验证路径</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Merkle 证明计算过程可视化
 */
function ProofCalculationVisualization({
  txId,
  proof,
  merkleRoot,
}: {
  txId: string
  proof: MerkleProofStep[]
  merkleRoot: string
}) {
  const shortHash = (hash: string) => hash.substring(0, 12) + '...'

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <GitBranch className="w-5 h-5 text-blue-600" />
        验证计算过程
      </h3>

      <div className="space-y-3">
        {/* 起始：目标交易 */}
        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex-shrink-0 w-20 text-sm font-medium text-yellow-700">
            开始
          </div>
          <div className="flex-1">
            <div className="text-xs text-yellow-600 mb-1">目标交易哈希</div>
            <div className="font-mono text-sm text-yellow-800">
              {shortHash(txId)}
            </div>
          </div>
        </div>

        {/* 计算步骤 */}
        {proof.map((step, index) => (
          <div key={index} className="relative">
            {/* 连接箭头 */}
            <div className="absolute left-10 -top-2 text-gray-400 text-lg">↓</div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex-shrink-0 w-20 text-sm font-medium text-purple-700">
                第 {index + 1} 步
              </div>
              <div className="flex-1">
                <div className="text-xs text-purple-600 mb-1">
                  与{step.position === 'left' ? '左' : '右'}兄弟节点合并计算
                </div>
                <div className="flex items-center gap-2 font-mono text-sm">
                  {step.position === 'left' ? (
                    <>
                      <span className="text-purple-600">
                        {shortHash(step.hash)}
                      </span>
                      <span className="text-gray-400">+</span>
                      <span className="text-gray-600">当前值</span>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-600">当前值</span>
                      <span className="text-gray-400">+</span>
                      <span className="text-purple-600">
                        {shortHash(step.hash)}
                      </span>
                    </>
                  )}
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-500">Hash()</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* 连接箭头到结果 */}
        <div className="relative">
          <div className="absolute left-10 -top-2 text-gray-400 text-lg">↓</div>

          {/* 结果：Merkle Root */}
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex-shrink-0 w-20 text-sm font-medium text-emerald-700">
              结果
            </div>
            <div className="flex-1">
              <div className="text-xs text-emerald-600 mb-1">计算得到 Merkle Root</div>
              <div className="font-mono text-sm text-emerald-800">
                {shortHash(merkleRoot)}
              </div>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MerkleVerifier() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(
    null
  )
  const [selectedTxId, setSelectedTxId] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    loadBlocks()
  }, [])

  const loadBlocks = async () => {
    try {
      const res = await blockchainAPI.getBlockchain()
      setBlocks(res.data.chain)
    } catch (err) {
      console.error('加载区块失败:', err)
    }
  }

  const handleVerify = async () => {
    if (selectedBlockIndex === null || !selectedTxId) {
      alert('请选择区块和交易')
      return
    }

    try {
      setVerifying(true)
      setResult(null)

      const res = await merkleAPI.verify({
        blockIndex: selectedBlockIndex,
        txId: selectedTxId,
      })

      setResult(res.data)
    } catch (err: any) {
      alert('验证失败: ' + (err.error || '未知错误'))
    } finally {
      setVerifying(false)
    }
  }

  const selectedBlock = blocks.find((b) => b.index === selectedBlockIndex)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Merkle 验证器</h1>

      {/* 概念说明卡片 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-3">
          什么是 Merkle 树？
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              Merkle 树是一种<strong>二叉哈希树</strong>
              ，用于高效验证数据的完整性。
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>叶子节点是各个交易的哈希值</li>
              <li>父节点是两个子节点哈希的组合哈希</li>
              <li>根节点（Merkle Root）代表所有交易的摘要</li>
            </ul>
          </div>
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              <strong>优势：</strong>只需提供少量哈希值（O(log n)）即可验证任一交易是否在区块中。
            </p>
            <p>
              <strong>应用：</strong>SPV（简单支付验证）钱包可以不下载完整区块，只需 Merkle 证明即可验证交易。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 左侧：选择器和结果 */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">选择验证目标</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择区块
              </label>
              <select
                value={selectedBlockIndex ?? ''}
                onChange={(e) => {
                  setSelectedBlockIndex(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                  setSelectedTxId('')
                  setResult(null)
                }}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">请选择区块</option>
                {blocks.map((block) => (
                  <option key={block.index} value={block.index}>
                    #{block.index} - {block.transactions.length} 笔交易
                  </option>
                ))}
              </select>
            </div>

            {selectedBlock && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择交易
                </label>
                <select
                  value={selectedTxId}
                  onChange={(e) => {
                    setSelectedTxId(e.target.value)
                    setResult(null)
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">请选择交易</option>
                  {selectedBlock.transactions.map((tx, idx) => (
                    <option key={tx.id} value={tx.id}>
                      TX #{idx}: {tx.id.substring(0, 20)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={verifying || !selectedBlockIndex || !selectedTxId}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <GitBranch className="w-4 h-4" />
              {verifying ? '验证中...' : '验证 Merkle 证明'}
            </button>
          </div>

          {/* 验证结果 */}
          {result && (
            <div
              className={`border rounded-lg p-6 ${
                result.isValid
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                {result.isValid ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">
                      验证成功 ✓
                    </h3>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-800">
                      验证失败 ✗
                    </h3>
                  </>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">区块索引:</span>
                  <span className="ml-2 font-bold">#{result.blockIndex}</span>
                </div>
                <div>
                  <span className="text-gray-600">证明路径长度:</span>
                  <span className="ml-2 font-bold">
                    {result.proof.length} 步
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Merkle Root:</span>
                  <div className="font-mono text-xs mt-1 break-all bg-white/50 p-2 rounded">
                    {result.merkleRoot}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 计算过程可视化 */}
          {result && result.isValid && (
            <ProofCalculationVisualization
              txId={result.txId}
              proof={result.proof}
              merkleRoot={result.merkleRoot}
            />
          )}
        </div>

        {/* 右侧：树形可视化 */}
        <div className="space-y-4">
          {selectedBlock ? (
            <MerkleTreeVisualization
              txIds={selectedBlock.transactions.map((tx) => tx.id)}
              targetTxId={selectedTxId}
              proof={result?.proof || []}
              merkleRoot={selectedBlock.merkleRoot}
            />
          ) : (
            <div className="bg-slate-900 rounded-xl p-12 text-center">
              <TreeDeciduous className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500">选择区块后将显示 Merkle 树结构</p>
            </div>
          )}

          {/* 原理图解 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Merkle 证明原理</h3>
            <div className="relative">
              {/* ASCII 风格的树形图 */}
              <pre className="text-xs font-mono text-gray-600 bg-gray-50 p-4 rounded overflow-x-auto">
                {`                    ┌─────────────┐
                    │ Merkle Root │  ← 存储在区块头
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
        ┌─────┴─────┐             ┌─────┴─────┐
        │   H(AB)   │             │   H(CD)   │
        └─────┬─────┘             └─────┬─────┘
              │                         │
       ┌──────┴──────┐           ┌──────┴──────┐
       │             │           │             │
    ┌──┴──┐       ┌──┴──┐     ┌──┴──┐       ┌──┴──┐
    │ H(A)│       │ H(B)│     │ H(C)│       │ H(D)│
    └──┬──┘       └──┬──┘     └──┬──┘       └──┬──┘
       │             │           │             │
    ┌──┴──┐       ┌──┴──┐     ┌──┴──┐       ┌──┴──┐
    │ TX A│       │ TX B│     │ TX C│       │ TX D│
    └─────┘       └─────┘     └─────┘       └─────┘

验证 TX B 只需要: H(A) + H(CD) = 2 个哈希值
而不需要知道 TX A, TX C, TX D 的完整内容`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

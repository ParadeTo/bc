/**
 * 交易输入类
 * 表示交易的输入，引用之前的 UTXO
 */
export class TxInput {
  /**
   * @param txId 引用的交易 ID
   * @param outputIndex 引用的输出索引
   * @param signature 签名（可选，构建时可能还未签名）
   * @param publicKey 公钥（可选，用于验证签名）
   */
  constructor(
    public readonly txId: string,
    public readonly outputIndex: number,
    public signature: string = '',
    public publicKey: string = ''
  ) {
    if (!txId || txId.trim().length === 0) {
      throw new Error('交易 ID 不能为空')
    }
    if (outputIndex < 0) {
      throw new Error('输出索引不能为负数')
    }
  }

  /**
   * 设置签名
   * @param signature 签名
   * @param publicKey 公钥
   */
  setSignature(signature: string, publicKey: string): void {
    this.signature = signature
    this.publicKey = publicKey
  }

  /**
   * 是否已签名
   */
  isSigned(): boolean {
    return this.signature.length > 0 && this.publicKey.length > 0
  }

  /**
   * 转换为 JSON 对象
   */
  toJSON(): {
    txId: string
    outputIndex: number
    signature: string
    publicKey: string
  } {
    return {
      txId: this.txId,
      outputIndex: this.outputIndex,
      signature: this.signature,
      publicKey: this.publicKey
    }
  }

  /**
   * 从 JSON 对象创建
   */
  static fromJSON(json: {
    txId: string
    outputIndex: number
    signature?: string
    publicKey?: string
  }): TxInput {
    return new TxInput(
      json.txId,
      json.outputIndex,
      json.signature || '',
      json.publicKey || ''
    )
  }

  /**
   * 转换为字符串（用于哈希计算，不包含签名）
   */
  toStringForSigning(): string {
    return JSON.stringify({
      txId: this.txId,
      outputIndex: this.outputIndex
    })
  }

  /**
   * 转换为字符串（包含签名）
   */
  toString(): string {
    return JSON.stringify(this.toJSON())
  }

  /**
   * 获取 UTXO 引用的唯一标识
   * 格式: txId:outputIndex
   */
  getUTXOKey(): string {
    return `${this.txId}:${this.outputIndex}`
  }

  /**
   * 克隆输入
   */
  clone(): TxInput {
    return new TxInput(
      this.txId,
      this.outputIndex,
      this.signature,
      this.publicKey
    )
  }
}



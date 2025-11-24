/**
 * 交易输出类
 * 表示交易的输出，包含金额和接收地址
 */
export class TxOutput {
  /**
   * @param amount 输出金额（单位：BTC）
   * @param address 接收地址
   */
  constructor(
    public readonly amount: number,
    public readonly address: string
  ) {
    if (amount <= 0) {
      throw new Error('输出金额必须大于 0')
    }
    if (!address || address.trim().length === 0) {
      throw new Error('接收地址不能为空')
    }
  }

  /**
   * 转换为 JSON 对象
   */
  toJSON(): { amount: number; address: string } {
    return {
      amount: this.amount,
      address: this.address
    }
  }

  /**
   * 从 JSON 对象创建
   */
  static fromJSON(json: { amount: number; address: string }): TxOutput {
    return new TxOutput(json.amount, json.address)
  }

  /**
   * 转换为字符串（用于哈希计算）
   */
  toString(): string {
    return JSON.stringify(this.toJSON())
  }

  /**
   * 克隆输出
   */
  clone(): TxOutput {
    return new TxOutput(this.amount, this.address)
  }
}



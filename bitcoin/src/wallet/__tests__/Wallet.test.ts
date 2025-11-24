import {Wallet} from '../Wallet'

describe('Wallet', () => {
  describe('构造函数', () => {
    it('应该创建新钱包', () => {
      const wallet = new Wallet()

      expect(wallet.privateKey).toBeTruthy()
      expect(wallet.publicKey).toBeTruthy()
      expect(wallet.address).toBeTruthy()
    })

    it('应该从私钥创建钱包', () => {
      const wallet1 = new Wallet()
      const privateKey = wallet1.privateKey

      const wallet2 = Wallet.fromPrivateKey(privateKey)

      expect(wallet2.privateKey).toBe(wallet1.privateKey)
      expect(wallet2.publicKey).toBe(wallet1.publicKey)
      expect(wallet2.address).toBe(wallet1.address)
    })

    it('不同钱包应该有不同地址', () => {
      const wallet1 = new Wallet()
      const wallet2 = new Wallet()

      expect(wallet1.address).not.toBe(wallet2.address)
    })
  })

  describe('地址生成', () => {
    it('地址应该是 Base58 格式', () => {
      const wallet = new Wallet()

      // Base58 字符集（不包含 0, O, I, l）
      const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/
      expect(wallet.address).toMatch(base58Regex)
    })

    it('地址长度应该在合理范围内', () => {
      const wallet = new Wallet()

      expect(wallet.address.length).toBeGreaterThanOrEqual(20)
      expect(wallet.address.length).toBeLessThanOrEqual(40)
    })

    it('相同私钥应该生成相同地址', () => {
      const wallet1 = new Wallet()
      const wallet2 = new Wallet(wallet1.privateKey)

      expect(wallet2.address).toBe(wallet1.address)
    })
  })

  describe('签名和验证', () => {
    it('应该能够签名和验证数据', () => {
      const wallet = new Wallet()
      const data = 'transaction data'

      const signature = wallet.sign(data)
      const isValid = wallet.verify(data, signature)

      expect(signature).toBeTruthy()
      expect(isValid).toBe(true)
    })

    it('修改数据后签名应该无效', () => {
      const wallet = new Wallet()
      const data = 'original data'

      const signature = wallet.sign(data)
      const isValid = wallet.verify('modified data', signature)

      expect(isValid).toBe(false)
    })

    it('应该能够签名交易对象', () => {
      const wallet = new Wallet()
      const transaction = {
        from: wallet.address,
        to: 'recipient address',
        amount: 50
      }

      const txData = JSON.stringify(transaction)
      const signature = wallet.sign(txData)
      const isValid = wallet.verify(txData, signature)

      expect(isValid).toBe(true)
    })
  })

  describe('导出功能', () => {
    it('应该能够导出钱包信息', () => {
      const wallet = new Wallet()
      const exported = wallet.export()

      expect(exported).toHaveProperty('privateKey')
      expect(exported).toHaveProperty('publicKey')
      expect(exported).toHaveProperty('address')
      expect(exported.privateKey).toBe(wallet.privateKey)
      expect(exported.publicKey).toBe(wallet.publicKey)
      expect(exported.address).toBe(wallet.address)
    })

    it('导出的私钥可以用于恢复钱包', () => {
      const wallet1 = new Wallet()
      const exported = wallet1.export()

      const wallet2 = Wallet.fromPrivateKey(exported.privateKey)

      expect(wallet2.address).toBe(wallet1.address)
      expect(wallet2.publicKey).toBe(wallet1.publicKey)
    })
  })

  describe('isValidAddress', () => {
    it('应该验证有效的地址', () => {
      const wallet = new Wallet()

      const isValid = Wallet.isValidAddress(wallet.address)

      expect(isValid).toBe(true)
    })

    it('应该拒绝空字符串', () => {
      expect(Wallet.isValidAddress('')).toBe(false)
    })

    it('应该拒绝太短的地址', () => {
      expect(Wallet.isValidAddress('1234')).toBe(false)
    })

    it('应该拒绝包含无效字符的地址', () => {
      // 包含 0, O, I, l 等无效 Base58 字符
      expect(Wallet.isValidAddress('0OIl' + 'a'.repeat(30))).toBe(false)
    })

    it('应该拒绝太长的地址', () => {
      const longAddress = '1' + 'a'.repeat(50)
      expect(Wallet.isValidAddress(longAddress)).toBe(false)
    })
  })

  describe('toString', () => {
    it('应该返回可读的字符串表示', () => {
      const wallet = new Wallet()
      const str = wallet.toString()

      expect(str).toContain('Wallet')
      expect(str).toContain(wallet.address.substring(0, 10))
    })
  })

  describe('边界情况', () => {
    it('应该能够签名空字符串', () => {
      const wallet = new Wallet()

      const signature = wallet.sign('')
      const isValid = wallet.verify('', signature)

      expect(isValid).toBe(true)
    })

    it('应该能够处理长数据', () => {
      const wallet = new Wallet()
      const longData = 'x'.repeat(10000)

      const signature = wallet.sign(longData)
      const isValid = wallet.verify(longData, signature)

      expect(isValid).toBe(true)
    })
  })
})



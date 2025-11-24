import {KeyPair} from '../KeyPair'

describe('KeyPair', () => {
  describe('构造函数', () => {
    it('应该生成新的密钥对（无参数）', () => {
      const keyPair = new KeyPair()

      expect(keyPair.privateKey).toBeTruthy()
      expect(keyPair.publicKey).toBeTruthy()
      expect(keyPair.privateKey).toHaveLength(64)
      expect(keyPair.publicKey).toHaveLength(130)
    })

    it('应该从私钥创建密钥对', () => {
      const keyPair1 = new KeyPair()
      const privateKey = keyPair1.privateKey

      const keyPair2 = new KeyPair(privateKey)

      expect(keyPair2.privateKey).toBe(privateKey)
      expect(keyPair2.publicKey).toBe(keyPair1.publicKey)
    })

    it('不同实例应该生成不同的密钥', () => {
      const keyPair1 = new KeyPair()
      const keyPair2 = new KeyPair()

      expect(keyPair1.privateKey).not.toBe(keyPair2.privateKey)
      expect(keyPair1.publicKey).not.toBe(keyPair2.publicKey)
    })
  })

  describe('sign 和 verify', () => {
    it('应该能够签名和验证数据', () => {
      const keyPair = new KeyPair()
      const data = 'Hello, Bitcoin!'

      const signature = keyPair.sign(data)
      const isValid = keyPair.verify(data, signature)

      expect(signature).toBeTruthy()
      expect(isValid).toBe(true)
    })

    it('修改数据后签名应该无效', () => {
      const keyPair = new KeyPair()
      const data = 'original data'
      const modifiedData = 'modified data'

      const signature = keyPair.sign(data)
      const isValid = keyPair.verify(modifiedData, signature)

      expect(isValid).toBe(false)
    })

    it('其他密钥对不能验证签名', () => {
      const keyPair1 = new KeyPair()
      const keyPair2 = new KeyPair()
      const data = 'test data'

      const signature = keyPair1.sign(data)
      const isValid = keyPair2.verify(data, signature)

      expect(isValid).toBe(false)
    })
  })

  describe('isValid', () => {
    it('有效的密钥对应该返回 true', () => {
      const keyPair = new KeyPair()

      expect(keyPair.isValid()).toBe(true)
    })

    it('从私钥恢复的密钥对应该有效', () => {
      const keyPair1 = new KeyPair()
      const keyPair2 = new KeyPair(keyPair1.privateKey)

      expect(keyPair2.isValid()).toBe(true)
    })
  })

  describe('JSON 序列化', () => {
    it('应该能够导出为 JSON', () => {
      const keyPair = new KeyPair()
      const json = keyPair.toJSON()

      expect(json).toHaveProperty('privateKey')
      expect(json).toHaveProperty('publicKey')
      expect(json.privateKey).toBe(keyPair.privateKey)
      expect(json.publicKey).toBe(keyPair.publicKey)
    })

    it('应该能够从 JSON 导入', () => {
      const keyPair1 = new KeyPair()
      const json = keyPair1.toJSON()

      const keyPair2 = KeyPair.fromJSON(json)

      expect(keyPair2.privateKey).toBe(keyPair1.privateKey)
      expect(keyPair2.publicKey).toBe(keyPair1.publicKey)
    })

    it('导出导入后的密钥对应该能正常工作', () => {
      const keyPair1 = new KeyPair()
      const data = 'test message'
      const signature = keyPair1.sign(data)

      const json = keyPair1.toJSON()
      const keyPair2 = KeyPair.fromJSON(json)

      const isValid = keyPair2.verify(data, signature)
      expect(isValid).toBe(true)
    })
  })
})



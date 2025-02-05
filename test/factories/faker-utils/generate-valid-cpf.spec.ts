import { CPF } from '@/domain/user/enterprise/entities/value-objects/cpf'
import { generateValidCpf } from './generate-valid-cpf'

const validateCpfWithClass = (cpf: string): boolean => {
  try {
    const cpfInstance = CPF.create(cpf)
    return cpfInstance.getRaw() === cpf
  } catch (error) {
    return false
  }
}

describe('generateValidCpf', () => {
  it('should generate a CPF with 11 digits', () => {
    const cpf = generateValidCpf()
    expect(cpf.length).toBe(11)
    expect(validateCpfWithClass(cpf)).toBe(true)
  })

  it('should not generate a CPF with more or less than 11 digits', () => {
    const cpf = generateValidCpf()
    expect(cpf.length).toBe(11)
  })

  it('should generate different CPF numbers each time', () => {
    const cpf1 = generateValidCpf()
    const cpf2 = generateValidCpf()
    expect(cpf1).not.toBe(cpf2)
  })

  it('should throw error for invalid CPF format', () => {
    const invalidCpf = '12345678900'
    expect(() => CPF.create(invalidCpf)).toThrowError('Invalid CPF')
  })
})

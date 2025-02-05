import { describe, it, expect } from 'vitest'
import { CPF } from './cpf'

describe('CPF Value Object', () => {
  it('should create a valid CPF instance', () => {
    const validCPF = '123.456.789-09'
    const cpf = CPF.create(validCPF)

    expect(cpf.getRaw()).toBe('12345678909')
    expect(cpf.getFormatted()).toBe('123.456.789-09')
    expect(cpf.toString()).toBe('123.456.789-09')
  })

  it('should throw an error for an invalid CPF', () => {
    const invalidCPF = '123.456.789-00'

    expect(() => CPF.create(invalidCPF)).toThrowError('Invalid CPF')
  })

  it('should throw an error for a CPF with all identical digits', () => {
    const invalidCPF = '111.111.111-11'

    expect(() => CPF.create(invalidCPF)).toThrowError('Invalid CPF')
  })

  it('should validate a CPF without formatting', () => {
    const rawCPF = '12345678909'
    const cpf = CPF.create(rawCPF)

    expect(cpf.getRaw()).toBe('12345678909')
    expect(cpf.getFormatted()).toBe('123.456.789-09')
  })

  it('should clean the CPF by removing non-numeric characters', () => {
    const messyCPF = ' 123.456.789-09 '
    const cpf = CPF.create(messyCPF)

    expect(cpf.getRaw()).toBe('12345678909')
    expect(cpf.getFormatted()).toBe('123.456.789-09')
  })

  it('should handle edge cases of incorrect CPF length', () => {
    const shortCPF = '123'
    const longCPF = '1234567890123'

    expect(() => CPF.create(shortCPF)).toThrowError('Invalid CPF')
    expect(() => CPF.create(longCPF)).toThrowError('Invalid CPF')
  })
})

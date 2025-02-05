import { faker } from '@faker-js/faker'

export function generateValidCpf(): string {
  const firstNineDigits = faker.number
    .int({ min: 100000000, max: 999999999 })
    .toString()

  const calculateCpfDigit = (cpfBase: string, weight: number[]): number => {
    const sum = cpfBase
      .split('')
      .reduce((acc, num, idx) => acc + parseInt(num) * weight[idx], 0)
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  const digit10 = calculateCpfDigit(
    firstNineDigits,
    [10, 9, 8, 7, 6, 5, 4, 3, 2],
  )

  const digit11 = calculateCpfDigit(
    firstNineDigits + digit10,
    [11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
  )

  return firstNineDigits + digit10 + digit11
}

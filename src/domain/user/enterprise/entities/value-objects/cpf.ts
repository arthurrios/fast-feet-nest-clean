export class CPF {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  /**
   * Factory method to create a CPF instance after validation.
   */
  static create(cpf: string): CPF {
    const cleanedCPF = CPF.clean(cpf)

    if (!CPF.isValid(cleanedCPF)) {
      throw new Error('Invalid CPF')
    }

    return new CPF(cleanedCPF)
  }

  /**
   * Cleans the CPF string, removing non-numeric characters.
   */
  private static clean(cpf: string): string {
    return cpf.replace(/\D/g, '')
  }

  /**
   * Validates a CPF number, ensuring it follows Brazilian CPF rules.
   */
  private static isValid(cpf: string): boolean {
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false

    const calculateDigit = (base: number): number => {
      const total = cpf
        .slice(0, base)
        .split('')
        .reduce(
          (sum, num, index) => sum + parseInt(num) * (base + 1 - index),
          0,
        )

      const remainder = total % 11
      return remainder < 2 ? 0 : 11 - remainder
    }

    const digit1 = calculateDigit(9)
    const digit2 = calculateDigit(10)

    return digit1 === parseInt(cpf[9]) && digit2 === parseInt(cpf[10])
  }

  /**
   * Returns the CPF in its raw format (numbers only).
   */
  getRaw(): string {
    return this.value
  }

  /**
   * Returns the CPF formatted as XXX.XXX.XXX-XX.
   */
  getFormatted(): string {
    return this.value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
  }

  /**
   * Returns the string representation of the CPF.
   */
  toString(): string {
    return this.getFormatted()
  }

  equals(cpf: CPF) {
    if (cpf === this) {
      return true
    }

    if (cpf.getRaw() === this.getRaw()) {
      return true
    }

    return false
  }
}

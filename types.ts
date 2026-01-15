export interface Rate {
  parcelas: number;
  taxa: number;
}

export interface CalculationResult {
  totalCharge: number; // Valor passado na maquininha
  clientReceives: number; // Valor na mão do cliente
  installmentValue: number; // Valor da parcela
  machineCost: number; // Custo da taxa
  profit: number; // Lucro real
  commission: number; // 30% do lucro
}

export type CalculationMode = 'borrow' | 'limit';
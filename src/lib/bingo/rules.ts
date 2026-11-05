import { BingoCardMatrix, BingoColumn } from '../types/database';

export const BINGO_RANGES: Record<BingoColumn, { min: number; max: number }> = {
  B: { min: 1, max: 15 },
  I: { min: 16, max: 30 },
  N: { min: 31, max: 45 },
  G: { min: 46, max: 60 },
  O: { min: 61, max: 75 },
};

export const BINGO_LETTERS: BingoColumn[] = ['B', 'I', 'N', 'G', 'O'];

/**
 * Retorna la letra correspondiente a una bola de bingo del 1 al 75
 */
export function getLetterForNumber(num: number): BingoColumn {
  if (num >= 1 && num <= 15) return 'B';
  if (num >= 16 && num <= 30) return 'I';
  if (num >= 31 && num <= 45) return 'N';
  if (num >= 46 && num <= 60) return 'G';
  if (num >= 61 && num <= 75) return 'O';
  throw new Error(`Número de bola fuera de rango (1-75): ${num}`);
}

/**
 * Genera un arreglo de N números únicos dentro de un rango inclusivo
 */
function getRandomUniqueNumbers(min: number, max: number, count: number): number[] {
  const pool: number[] = [];
  for (let i = min; i <= max; i++) {
    pool.push(i);
  }
  // Algoritmo Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

/**
 * Genera un cartón de Bingo 75 bolas auténtico (5x5 con casilla FREE central)
 */
export function generateBingoCardMatrix(): BingoCardMatrix {
  const bNums = getRandomUniqueNumbers(BINGO_RANGES.B.min, BINGO_RANGES.B.max, 5);
  const iNums = getRandomUniqueNumbers(BINGO_RANGES.I.min, BINGO_RANGES.I.max, 5);
  const nNums = getRandomUniqueNumbers(BINGO_RANGES.N.min, BINGO_RANGES.N.max, 4);
  const gNums = getRandomUniqueNumbers(BINGO_RANGES.G.min, BINGO_RANGES.G.max, 5);
  const oNums = getRandomUniqueNumbers(BINGO_RANGES.O.min, BINGO_RANGES.O.max, 5);

  const nColumn: (number | 'FREE')[] = [
    nNums[0],
    nNums[1],
    'FREE',
    nNums[2],
    nNums[3],
  ];

  return {
    B: bNums,
    I: iNums,
    N: nColumn,
    G: gNums,
    O: oNums,
  };
}

/**
 * Convierte la matriz de columnas en una cuadrícula 5x5 de filas para fácil renderizado
 */
export function matrixToRows(matrix: BingoCardMatrix): (number | 'FREE')[][] {
  const rows: (number | 'FREE')[][] = [];
  for (let r = 0; r < 5; r++) {
    rows.push([
      matrix.B[r],
      matrix.I[r],
      matrix.N[r],
      matrix.G[r],
      matrix.O[r],
    ]);
  }
  return rows;
}

/**
 * Comprueba si un valor de celda está marcado (bien por ser FREE o por estar en los números extraídos)
 */
export function isCellMarked(
  val: number | 'FREE',
  drawnNumbers: Set<number> | number[]
): boolean {
  if (val === 'FREE') return true;
  if (drawnNumbers instanceof Set) {
    return drawnNumbers.has(val);
  }
  return drawnNumbers.includes(val);
}

export interface WinEvaluationResult {
  hasLine: boolean;
  hasBingo: boolean;
  winningLines: string[]; // e.g. ["row-1", "diag-main"]
  markedCount: number;
  remainingForBingo: number;
}

/**
 * Evalúa las victorias (Línea horizontal, vertical, diagonal y Cartón Lleno / BINGO)
 */
export function evaluateCard(
  matrix: BingoCardMatrix,
  drawnNumbersList: number[]
): WinEvaluationResult {
  const drawn = new Set(drawnNumbersList);
  const rows = matrixToRows(matrix);
  const winningLines: string[] = [];
  let markedCount = 1; // "FREE" cuenta como marcada siempre

  // Matriz booleana de celdas marcadas [row][col]
  const markedGrid: boolean[][] = rows.map((row, rIdx) =>
    row.map((cell, cIdx) => {
      const isMarked = isCellMarked(cell, drawn);
      if (isMarked && cell !== 'FREE') markedCount++;
      return isMarked;
    })
  );

  // 1. Revisar Filas Horizontales
  for (let r = 0; r < 5; r++) {
    if (markedGrid[r].every((marked) => marked)) {
      winningLines.push(`Fila ${r + 1}`);
    }
  }

  // 2. Revisar Columnas Verticales
  for (let c = 0; c < 5; c++) {
    if (
      markedGrid[0][c] &&
      markedGrid[1][c] &&
      markedGrid[2][c] &&
      markedGrid[3][c] &&
      markedGrid[4][c]
    ) {
      winningLines.push(`Columna ${BINGO_LETTERS[c]}`);
    }
  }

  // 3. Diagonal Principal (0,0 -> 4,4)
  if (
    markedGrid[0][0] &&
    markedGrid[1][1] &&
    markedGrid[2][2] &&
    markedGrid[3][3] &&
    markedGrid[4][4]
  ) {
    winningLines.push('Diagonal Principal');
  }

  // 4. Diagonal Secundaria (0,4 -> 4,0)
  if (
    markedGrid[0][4] &&
    markedGrid[1][3] &&
    markedGrid[2][2] &&
    markedGrid[3][1] &&
    markedGrid[4][0]
  ) {
    winningLines.push('Diagonal Secundaria');
  }

  // 5. Comprobar BINGO (Full House / Cartón Lleno: 25 celdas marcadas)
  const isFullHouse = markedCount >= 25;

  return {
    hasLine: winningLines.length > 0,
    hasBingo: isFullHouse,
    winningLines,
    markedCount,
    remainingForBingo: Math.max(0, 25 - markedCount),
  };
}


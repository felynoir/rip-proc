import { modPow, modInv } from "bigint-mod-arith";

export const dot = (a: number[], b: number[]) =>
  a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);

export function bigintLog2Floor(n: bigint) {
  if (n <= 0n) {
    throw new Error("Input must be a positive integer.");
  }

  let log = 0n;
  while (n >= 1n) {
    n /= 2n;
    log += 1n;
  }

  return log;
}

export function sqrt(value: bigint) {
  if (value < 0n) {
    throw "square root of negative numbers is not supported";
  }

  if (value < 2n) {
    return value;
  }

  function newtonIteration(n: bigint, x0: bigint) {
    const x1 = (n / x0 + x0) >> 1n;
    if (x0 === x1 || x0 === x1 - 1n) {
      return x0;
    }
    return newtonIteration(n, x1);
  }

  return newtonIteration(value, 1n);
}

/**
 * Baby Step Giant Step Algorithm to solve g^x ≡ h (mod p)
 * Finds the discrete logarithm x such that g^x = h mod p.
 *
 * @param {bigint} g - The base (generator) of the group.
 * @param {bigint} h - The result of g^x mod p.
 * @param {bigint} p - The modulus (a prime number).
 * @return {bigint | null} - The exponent x, or null if no solution is found.
 */

export function babyStepGiantStep(
  g: bigint,
  h: bigint,
  p: bigint,
  m: bigint
): bigint | null {
  const babySteps = new Map<bigint, bigint>();
  let x = 1n;
  let y = h;
  let z = modInv(g, p);
  z = modPow(z, 2n, p);

  let bits = bigintLog2Floor(m);
  babySteps.set(x, 0n);
  x = x * g;
  x = x % p;
  let j = 0n;
  let giantStep,
    bound = 0n;

  for (let i = 0; i < bits; i++) {
    giantStep = 2n ** BigInt(i + 1);
    if (giantStep > m) {
      giantStep = m;
      z = modInv(g, p);
      z = modPow(z, m, p);
    }

    for (let k = 2n ** BigInt(i); k < giantStep; k++) {
      babySteps.set(x, k);
      x = x * g;
      x = x % p;
    }

    bound = 2n ** BigInt(2 * (i + 1));
    while (j < bound) {
      if (babySteps.has(y)) {
        const e = babySteps.get(y)!;
        return j + e;
      }
      y = y * z;
      y = y % p;
      j = j + giantStep;
    }
    z = z * z;
    z = z % p;
  }

  return null;
}

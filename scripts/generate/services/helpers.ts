export const retry = <T>(f: () => T, n: number, err?: Error): T => {
  if (n === 0) throw err;

  try {
    return f();
  } catch (e) {
    return retry(f, n - 1, e);
  }
};

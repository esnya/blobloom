export function createResource<T>(fn: () => Promise<T>): () => T {
  let status: 'pending' | 'success' | 'error' = 'pending';
  let result: T;
  let error: unknown;
  const suspender = fn().then(
    (r) => {
      status = 'success';
      result = r;
    },
    (e) => {
      status = 'error';
      error = e;
    },
  );
  return () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    if (status === 'pending') throw suspender;
    if (status === 'error') {
      const err = error instanceof Error ? error : new Error(String(error));
      throw err;
    }
    return result;
  };
}

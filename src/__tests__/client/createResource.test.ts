import { createResource } from '../../client/resource';

describe('createResource', () => {
  it('throws the promise while pending', () => {
    let resolve: (v: number) => void;
    const p = new Promise<number>((r) => {
      resolve = r;
    });
    const read = createResource(() => p);

    let first: unknown;
    let second: unknown;
    try {
      read();
    } catch (e) {
      first = e;
    }
    try {
      read();
    } catch (e) {
      second = e;
    }

    expect(first).toBe(second);
    expect(first).toBeInstanceOf(Promise);

    resolve!(1);
  });

  it('returns resolved value', async () => {
    let resolve: (v: number) => void;
    const p = new Promise<number>((r) => {
      resolve = r;
    });
    const read = createResource(() => p);
    try {
      read();
    } catch {
      // ignore thrown promise
    }
    resolve!(42);
    await p;
    expect(read()).toBe(42);
  });

  it('rethrows errors as Error', async () => {
    let reject: (err: unknown) => void;
    const p = new Promise<unknown>((_, r) => {
      reject = r;
    });
    const read = createResource(() => p);
    try {
      read();
    } catch {
      // ignore thrown promise
    }
    reject!('boom');
    await p.catch(() => {});
    expect(() => read()).toThrow(Error);
  });
});

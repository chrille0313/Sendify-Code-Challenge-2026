export function deferredPromise<T>() {
  let resolve: (value: T | PromiseLike<T>) => void = () => {};
  let reject: (reason?: any) => void = () => {};

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}
export async function promiseWithTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  let timeout: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(message)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

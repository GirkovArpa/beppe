export function waitFor(condition, step = 250, timeout = Infinity) {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    let running = false;
    const interval = setInterval(async () => {
      if (running) return;
      running = true;
      const result = await condition();
      if (result) {
        clearInterval(interval);
        resolve(result);
      } else if (Date.now() - now >= timeout * 1000) {
        clearInterval(interval);
        reject(result);
      }
      running = false;
    }, step);
  });
}
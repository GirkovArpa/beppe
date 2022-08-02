import Beppe from './beppe.js';

main();

async function main() {
  const beppe = await new Beppe('https://example.com').connect();
  await beppe.execFunc(() => alert('Hello World!'));
  await beppe.goto('https://google.com/');
  const location = await beppe.eval('window.location.href');
  console.log(location);
}

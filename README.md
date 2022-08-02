<h1 align="center">
  <a href="https://github.com/GirkovArpa/beppe">
    <img src="logo.png" alt="Beppe Logo" width="128"/>
  </a>
  <br/>
  Beppe
</h1>

<h3 align="center">
  tiny alternative to puppeteer
</h3>

## Installation

```
npm i beppe
```

## Usage

```javascript
import Beppe from 'beppe';

main();

async function main() {
  const beppe = await new Beppe('https://example.com').connect();
  await beppe.execFunc(() => alert('Hello World!'));
  await beppe.goto('https://google.com/');
  const location = await beppe.eval('window.location.href');
  console.log(location); // https://google.com/
}
```
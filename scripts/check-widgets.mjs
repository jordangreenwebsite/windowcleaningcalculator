import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
for (const path of ['src/widgets/calculator.html','src/widgets/local-pricing.html']) {
  const source = readFileSync(path, 'utf8');
  const scripts = [...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  if (scripts.length !== 1) throw new Error(path + ': expected exactly one inline script, got ' + scripts.length);
  new Script(scripts[0][1], {filename: path});
  console.log(path + ': JavaScript parses successfully');
}
const calculator = readFileSync('src/widgets/calculator.html', 'utf8');
for (const signal of ['save_calculation','cleaner_feedback','email_result','postcodes.io','appsScriptUrl']) {
  if (!calculator.includes(signal)) throw new Error('Missing calculator feature/integration: ' + signal);
}

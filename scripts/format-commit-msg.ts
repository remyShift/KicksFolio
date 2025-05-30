const fs = require('fs');

const msgFile = process.argv[2];
let msg = fs.readFileSync(msgFile, 'utf8').trim();

const conventionalRegex =
	/^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert|wip)(\(.+\))?: .+/;

if (!conventionalRegex.test(msg)) {
	msg = `chore: ${msg}`;
	fs.writeFileSync(msgFile, msg);
	console.log('Commit message formatted :', msg);
}

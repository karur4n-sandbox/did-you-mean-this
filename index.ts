const exec = require("child_process").exec;
const levenshtein = require("fast-levenshtein");

type Command = {
  [key: string]: string;
};

const commands: Command = {
  "build:dev": "echo dev",
  "build:production": "echo production"
};

const commandKey = process.argv[2];

if (commandKey == undefined) {
  process.stdout.write("コマンドを与えてください\n");
  process.exit(1);
}

const commandValue = commands[commandKey];

if (commandValue) {
  exec(commandValue, (_: Error, stdout: string) => {
    process.stdout.write(stdout);
    process.exit(0);
  });
} else {
  // [コマンド, レーベンシュタイン距離]
  type LevenshteinCount = [string, number];

  const levenshteinCounts = Object.keys(commands).map(
    (key): LevenshteinCount => [key, levenshtein.get(key, commandKey)]
  );

  const minimumLevenshtein = minimum(levenshteinCounts, (a, b) => a[1] - b[1]);

  if (minimumLevenshtein[1] < 6) {
    process.stdout.write("Did you mean this?\n");
    process.stdout.write(minimumLevenshtein[0] + "\n");
  }
}

//
// minimum
//
function minimum<T>(
  arry: T[],
  comparator: MinimumComparator<T> | undefined
): T | undefined {
  if (arry.length === 1) {
    return undefined;
  }

  const sorted = (() => {
    if (typeof comparator == "function") {
      return [...arry].sort(comparator);
    } else {
      return [...arry].sort();
    }
  })();

  return sorted[0];
}

type MinimumComparator<T> = (a: T, b: T) => number;

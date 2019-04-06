declare const wordlist: string[];

const briefs = {
  t: "the",
  o: "of",
  k: "and",
  w: "was",
  f: "for",
  u: "you",
  b: "be",
  i: "I",
  z: "is",
  r: "are",
  n: "not",
  ty: "they",

  oa: "of a",
  ot: "of the",
  im: "I'm",
  il: "I'll",
  ur: "your",
  uer: "you're",
  ts: "it's",
  int: "isn't",
  dnt: "doesn't",
  dnst: "doesn't",
  dnot: "don't",
  wnt: "wasn't",
  wont: "won't",

  gm: "government",
  ao: "another",
  st: "something",
  df: "different",
  cenr: "children",
  tho: "although",
  imp: "important",
  ifn: "information",
  co: "company",
  po: "possible",
  dev: "development",
  cou: "country",
  hms: "himself",
  ocf: "of course", // "political", "problem", "towards", "anything", "problems", "probably", "education", "question", "for_example", "society", "themselves", "including", "community", "difficult", "particularly", "special", "particular", "international", "certain", "minister", "industry", "century", "yesterday", "history", "programme", "experience", "everything", "certainly", "section", "minutes", "authority", "working", "necessary", "central", "because_of", "english"
  et: "everything",
  aht: "anything",
  pbor: "problem",
  pbors: "problems",
  edu: "education"
};

const strokeKeyRegex = /^[a-z0-9,.]$|^shift$/;
const wordsSet: Set<string> = new Set<string>();

for (const line of wordlist) {
  wordsSet.add(line.split(" ")[1]);
}

const words = [...wordsSet];

function isDigit(c: string): boolean {
  return c.length === 1 && c >= "0" && c <= "9";
}

function isntDigit(c: string): boolean {
  return !isDigit(c);
}

function isPunctuation(c: string): boolean {
  return c === "." || c === ",";
}

function isntPunctuation(c: string): boolean {
  return !isPunctuation(c);
}

function capitalize(s: string): string {
  return s.substring(0, 1).toUpperCase() + s.substr(1);
}

function main() {
  const pad = document.getElementById("pad");
  const keyDisplay = document.getElementById("key-display");
  const strokeHeadDisplay = document.getElementById("stroke-head-display");
  const strokeTailDisplay = document.getElementById("stroke-tail-display");
  const resultsDisplay = document.getElementById("results-display");
  const wpmDisplay = document.getElementById("wpm-display");

  var buffer: string = "";
  var undo: string[] = [];
  var keySet: Set<string> = new Set<string>();
  var stroke: string[] = [];
  var stroking: boolean = false;
  var shiftStroke: boolean = false;
  var capitalizeNext: boolean = false;
  var strokeTimeout: number | undefined = undefined;
  var results: string[] = [];
  var startedTypingTime: Date | undefined = undefined;
  var cpm: number = NaN;

  var lastStrokeName: string = "";

  function updateCpm() {
    if (buffer) {
      if (startedTypingTime) {
        const now = new Date();
        const minutes = (Number(now) - Number(startedTypingTime)) / 60000;
        cpm = buffer.length / minutes;
      } else {
        startedTypingTime = new Date();
        cpm = NaN;
      }
    } else {
      startedTypingTime = undefined;
    }
  }

  function updateKeyDisplay() {
    const meat = stroke.filter(x => x !== "shift"); // just the letter-likes
    const head = meat.slice(0, 1).join("");
    const tail = meat
      .slice(1, meat.length)
      .sort()
      .join("");
    keyDisplay.innerText = [...keySet].join(", ");
    strokeHeadDisplay.innerText = head;
    strokeTailDisplay.innerText = tail;
    resultsDisplay.innerHTML =
      results
        .slice(0, 10)
        .map((r, i) => `<sup class=ri>${(i + 1) % 10}</sup>${r}`)
        .join(", ") ||
      (stroking ? "Waiting for stroke…" : `No results for ${lastStrokeName}.`);
    pad.innerText = buffer;
    wpmDisplay.innerText = isNaN(cpm) ? "" : `${(cpm / 5).toFixed(1)} wpm`;
  }

  function strokeResults(stroke: string[]) {
    if (stroke.length === 0) {
      return [];
    }

    const head = stroke[0];
    const tail = stroke.slice(1, stroke.length).sort();
    const canon = head + tail.join("");
    lastStrokeName = canon;
    const strokeRegexp = new RegExp(`^${head}[${canon}]*$`);
    const results = words
      .filter(w => w.match(strokeRegexp))
      .filter(w => tail.every(k => w.includes(k)));
    const brief = briefs[canon];
    return (brief ? [brief] : []).concat(results);
  }

  function commit(s: string) {
    if (capitalizeNext || shiftStroke) s = capitalize(s);
    capitalizeNext = s === ".";

    const spaceBefore = buffer.length > 0 && s.match(/^[a-z]/i);
    undo.push(buffer);
    buffer += (spaceBefore ? " " : "") + s;
  }

  function interpretStroke() {
    stroking = false;
    strokeTimeout = undefined;

    const shiftIndex = stroke.indexOf("shift");
    shiftStroke = false;
    if (shiftIndex >= 0) {
      stroke.splice(shiftIndex, 1);
      shiftStroke = true;
    }

    const one = stroke.length === 1;
    const canUndo = undo.length > 0;

    if (one && stroke[0] === "v") {
      if (canUndo && shiftStroke) {
        undo.push(buffer);
        buffer = "";
      } else if (canUndo) {
        buffer = undo.pop();
      }
    } else if (stroke.length === 1 && isDigit(stroke[0])) {
      if (canUndo) {
        const replacement = results[(Number(stroke[0]) + 9) % 10];
        if (replacement) {
          buffer = undo.pop();
          commit(replacement);
        }
      }
    } else {
      const punctuation = stroke.filter(isPunctuation);
      stroke = stroke.filter(isntPunctuation);
      const digits = stroke.filter(isDigit).map(d => (Number(d) + 9) % 10);
      stroke = stroke.filter(isntDigit);

      results = strokeResults(stroke);

      if (results.length > 0) {
        const i = Math.max(0, Math.min(results.length - 1, Math.max(...digits)));
        commit(results[i]);
      }

      if (punctuation.length > 0) {
        commit(punctuation[0]);
      }
    }

    // Clear the whole thing.
    stroke.splice(0, stroke.length);
    updateCpm();
    updateKeyDisplay();
  }

  function padKeydown(e: KeyboardEvent) {
    e.preventDefault();
    const key = e.key.toLowerCase();
    if (strokeTimeout !== undefined) {
      window.clearTimeout(strokeTimeout);
      strokeTimeout = undefined;
    }

    if (key.match(strokeKeyRegex)) {
      document.getElementById("key-" + key).style.backgroundColor = "#f05";
      keySet.add(key);
      // Add it to the stroke.
      if (!stroke.includes(key)) {
        stroking = true;
        stroke.push(key);
      }
      updateKeyDisplay();
    }
  }

  function padKeyup(e: KeyboardEvent) {
    e.preventDefault();
    const key = e.key.toLowerCase();
    if (key.match(strokeKeyRegex)) {
      document.getElementById("key-" + key).style.backgroundColor = "#444";
      keySet.delete(key);
      updateKeyDisplay();
      if (keySet.size === 0) {
        strokeTimeout = window.setTimeout(interpretStroke, 0);
      }
    }
  }

  pad.addEventListener("keydown", padKeydown);
  pad.addEventListener("keyup", padKeyup);
}

window.addEventListener("load", main);

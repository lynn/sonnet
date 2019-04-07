var fs = require("fs");

console.log("Copying index.html into dist folder...");
if (!fs.existsSync("dist")) fs.mkdirSync("dist");
fs.copyFileSync("src/index.html", "dist/index.html");

if (fs.existsSync("src/wordlist.js")) {
  console.log("wordlist.js already generated. That's good.");
} else {
  console.log("Generating wordlist.js...");
  var contents = fs.readFileSync("all.num.o5", "utf8");
  var wordlist = "export default `\n" + contents + "\n`.trim().split('\\n')";
  fs.writeFileSync("src/wordlist.js", wordlist);
  console.log("Done.");
}

console.log("Okay, bundle time.");
process.exit(0);

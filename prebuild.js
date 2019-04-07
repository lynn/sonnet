var fs = require("fs");

console.log("Copying index.html into dist folder...");
if (!fs.existsSync("dist")) fs.mkdirSync("dist");
fs.copyFileSync("src/index.html", "dist/index.html");

if (fs.existsSync("src/wordlist.js")) {
  console.log("wordlist.js already generated. That's good.");
  console.log("You can delete all.num.o5 now, if you'd like.");
} else {
  console.log("Generating wordlist.js...");
  if (!fs.existsSync("all.num.o5")) {
    console.log("Oops! I need a file called `all.num.o5` in this directory.");
    console.log("Please fetch it from: https://www.kilgarriff.co.uk/BNClists/all.num.o5");
    console.log("Read more about this frequency list here: https://www.kilgarriff.co.uk/bnc-readme.html");
    process.exit(1);
  };
  var contents = fs.readFileSync("all.num.o5", "utf8");
  var wordlist = "export default `\n" + contents + "\n`.trim().split('\\n')";
  fs.writeFileSync("src/wordlist.js", wordlist);
  console.log("Done.");
}

console.log("Okay, bundle time.");
process.exit(0);

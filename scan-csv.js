const args = require("minimist")(process.argv.slice(2));
const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");

const weathers = {
  pagos: [0, 4, 7, 3, 5, 8],
  pyros: [0, 4, 7, 3, 5, 9],
  hydatos: [0, 1, 7, 5, 6],
};

const file = args._[1];
const zone = args._[0];
parse(file, zone);

async function parse(fpath, zone) {
  const res = [];
  fs.createReadStream(path.resolve(__dirname, fpath))
    .pipe(csv.parse())
    .on("data", (row) => {
      res.push({
        level: Number(row[0]),
        name: getName(row[1]),
        type: getType(row[1]),
        elem: getElem(row[1]),
        conditions: getConditions(row.slice(2, 8), zone),
      });
    })
    .on("end", () => {
      fs.writeFileSync(
        path.resolve(__dirname, `src/${zone}.bestiary.js`),
        `export default const ${JSON.stringify(res)}`,
        { encoding: "utf8" }
      );
      console.log("Done!");
    });
}

function getName(nameStr) {
  return /^([\w\s]+)/i.exec(nameStr)[1];
}

function getType(nameStr) {
  if (/\(M\)/i.test(nameStr)) return 1;
  if (/\(A\)/i.test(nameStr)) return 2;
  return 0;
}

function getElem(nameStr) {
  let res = /\/(\w)/i.exec(nameStr);
  if (res) {
    switch (res[1]) {
      case "W":
        return "Wind";
      case "E":
        return "Thunder";
      case "H":
        return "Water";
      case "F":
        return "Fire";
      case "I":
        return "Ice";
      case "G":
        return "Earth";
    }
  }
  return null;
}

function getConditions(arr, zone) {
  const res = {
    day: [],
    night: [],
  };

  arr.forEach((el, i) => {
    if (el) {
      switch (el) {
        case "D":
          res.day.push(weathers[zone][i]);
          break;
        case "N":
          res.night.push(weathers[zone][i]);
          break;
        case "A":
          res.day.push(weathers[zone][i]);
          res.night.push(weathers[zone][i]);
          break;
      }
    }
  });

  return res;
}

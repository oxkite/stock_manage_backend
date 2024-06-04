const fs = require("fs");

const saveFile = async (path, catID, data, msg = "") => {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      `${path}telemartData-${catID}.json`,
      JSON.stringify(data, null, 2),
      (err) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        if (msg !== "") {
          console.log(msg);
        }
        resolve();
      }
    );
  });
};

module.exports = saveFile;

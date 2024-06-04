const fs = require("fs");

const readFile = async (filePath) => {
  try {
    const string1 = await fs.readFileSync(filePath);
    return JSON.parse(string1.toString());
  } catch (error) {
    console.error(
      `Got an error trying to read the file: ${error.message}-${filePath}`
    );
  }
};

module.exports = readFile;

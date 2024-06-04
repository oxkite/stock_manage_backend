const readFile = require("./readFile");
const saveFile = require("./saveFile");

const saveSameProduct = async (id) => {
  const data1 = await readFile(`./data-1/telemartData-${id}.json`);
  const data2 = await readFile(`./data-2/telemartData-${id}.json`);
  const result = data1.map((obj1) => {
    const obj2 = data2.find((item) => {
      const title1 = item.title.replace(/[^\w\s]/gi, "").trim();
      let title2 = obj1.name.replace(/[^\w\s]/gi, "").trim();
      if (title2.substring(title2.length - 3) === "LTE")
        title2 = title2.slice(0, -4);
      return title1 === title2;
    });
    if (obj2) {
      let str = obj2.price;
      let num1 = parseInt(str.split(" - ")[0].replace(",", ""));
      let num2 = num1;
      if (parseInt(str.split(" - ")[1]))
        num2 = parseInt(str.split(" - ")[1].split(" ")[0].replace(",", ""));
      return {
        proid: obj1.proid,
        productName: obj1.name,
        myPrice: obj1.saleprice,
        oppPrice1: num1,
        oppPrice2: num2,
        imgURL: obj2.imgURL,
        lowPrice: num2,
      };
    }
  });
  const newResult = result.filter((obj) => {
    return obj !== undefined && obj !== null;
  });
  saveFile("./data-3/", id, newResult, "Successfully save same products");
};

module.exports = saveSameProduct;

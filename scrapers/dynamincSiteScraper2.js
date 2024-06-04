const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const path = require("path");
const axios = require("axios");
const readFile = require("../readFile");
const tough = require("tough-cookie");
const saveFile = require("../saveFile");

const ZapProductPath = path.join(__dirname, "../data-2/");
const diffProductPath = path.join(__dirname, "../data-3/");

const scrapeDynamicWebpage2 = async (url, catID) => {
  let diffItems = [];
  let totalItems = [];
  let totalID = 0;
  let firstProduct = null;
  const data1 = await readFile(`./data-1/telemartData-${catID}.json`);
  const checkMyProduct = (item) => {
    const result = data1.filter((obj1) => {
      const title1 = item.title.replace(/[^\w\s]/gi, "").trim();
      let title2 = obj1.name.replace(/[^\w\s]/gi, "").trim();
      if (title2.substring(title2.length - 3) === "LTE")
        title2 = title2.slice(0, -4);
      return title1 === title2;
    });
    if (result.length === 0) {
      return item;
    }
    return false;
  };
  const analyzeProduct = (data, id, name, imagesrc) => {
    const $ = cheerio.load(data); // Scraping Module
    const list = $(".specificationContainer");
    const list1 = list.find(".paramRow");
    const item = { id: totalItems.length, modelId: id, title: name, imagesrc: imagesrc };
    list1.each((idx, ele) => {
      let paramCol = $(ele)
        .find(".ParamCol")
        .contents()
        .filter(function () {
          return this.type === "text";
        })
        .text()
        .trim();
      let paramColValue = $(ele)
        .find(".ParamColValue")
        .contents()
        .filter(function () {
          return this.type === "text";
        })
        .text()
        .trim();
      item[paramCol] = paramColValue;

      console.log("item.paramCol>>>>>>>>>", item[paramCol]);
    });

    const result = checkMyProduct(item);
    if(result) {
      console.log("Success ModelID>>>>>>>>>>>>>>>>>", item.modelId);
      diffItems.push(item);
    }

    totalItems.push(item);
  };
  const processData = (data) => {
    const $ = cheerio.load(data);
    // console.log($.html());
    // after you can target what you want by inspecting page source.
    const list1 = $(".withModelRow.ModelRow");
    const list2 = $(".noModelRow.ModelRow");
    if (list1.length === 0 && list2.length === 0) {
      return 0;
    }
    let items = [];
    let finish = 0;
    list1.each(async (idx, ele) => {
      // targeting different elements etc using cheerio.
      const targeted = $(ele);
      const title = targeted.find(".ModelTitle");
      const text = $(title[0]).text().trim();
      const img = targeted.find("img");
      const imgsrc = img.attr("data-src");
      if (firstProduct === null) firstProduct = text;
      else if (firstProduct === text) finish = 1;
      const modelId = targeted.attr("data-model-id");
      
      // Only different products will be posted Axios request
      const item = {
        title: $(title[0]).text().trim(),
        imgURL: imgsrc,
      };


      const res = checkMyProduct(item);
      if(res) {
        const url = `https://www.zap.co.il/compmodels.aspx?modelid=${modelId}`;
        const response = await axios.get(url);
        analyzeProduct(response.data, modelId, text, imgsrc);
        console.log("ModelID>>>>>>>>>",modelId);
      }
    });
    list2.each(async (idx, ele) => {
      // targeting different elements etc using cheerio.
      const targeted = $(ele);
      const title = targeted.find(".ModelTitle");
      const text = $(title[0]).text().trim();
      const img = targeted.find("img");
      const imgsrc = img.attr("data-src");
      if (firstProduct === null) firstProduct = text;
      else if (firstProduct === text) finish = 1;
      const modelId = targeted.attr("data-model-id");

      // Only different products will be posted Axios request
      const item = {
        title: $(title[0]).text().trim(),
        imgURL: imgsrc,
      };


      const res = checkMyProduct(item);
      if(res) {
        const url = `https://www.zap.co.il/compmodels.aspx?modelid=${modelId}`;
        const response = await axios.get(url);
        analyzeProduct(response.data, modelId, text, imgsrc);
        console.log("ModelID>>>>>>>>>",modelId);
      }
    });
    if (finish === 1) return 0;
    console.log("Different Item Size = ", diffItems.length);
    console.log("\n")
    diffItems = diffItems.concat(items);

    return 1;
    // Logs items array to the console
    // console.dir(items);
    // Write items array in itemsData.json file
  };
  let cookieJar = new tough.CookieJar();
  axios.defaults.withCredentials = true;
  for (let i = 1; ; i++) {
    if (i % 5 === 1) {
      cookieJar.removeAllCookies((err) => {
        if (err) throw err;
        console.log("Session cookies cleared");
      });
      cookieJar = new tough.CookieJar();
      axios.defaults.jar = cookieJar;
    }
    const response = await axios.get(`${url}&pageinfo=${i}`);
    console.log("\nNext Page>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    const result = processData(response.data);
    if (result === 0) {
      break;
    }
  }
  saveFile(
    diffProductPath,
    catID,
    diffItems,
    "Successfully get same product data"
  );
  saveFile(
    ZapProductPath,
    catID,
    totalItems,
    "Successfully get Zap product data"
  );
};

module.exports = scrapeDynamicWebpage2;
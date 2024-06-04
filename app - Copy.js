const PORT = 8080;
const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const sql = require("mssql");
const path = require("path");
const readFile = require("./readFile");
const saveFile = require("./saveFile");

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//const scrapeDynamicWebpage1 = require("./scrapers/dynamincSiteScraper1");
const scrapeDynamicWebpage2 = require("./scrapers/dynamincSiteScraper2");
const saveSameProduct = require("./saveSameProduct");
// const scrapeStaticWebpage = require("./scrapers/staticSiteScraper");
// const data = require("./data/itemsData.json");

const categories = {
  3: "https://www.zap.co.il/models.aspx?sog=c-pclaptop&db239046=239063",
  5: "https://www.zap.co.il/models.aspx?sog=c-pclaptop&db239046=239061",
  7: "https://www.zap.co.il/models.aspx?sog=c-pclaptop&db239046=239055",
  24: "https://www.zap.co.il/models.aspx?sog=c-pclaptop&db239046=239052",
  26: "https://www.zap.co.il/models.aspx?sog=c-pclaptop&db239046=9502498",
  330: "https://www.zap.co.il/models.aspx?sog=c-pclaptop&db239046=239048",
  344: "https://www.zap.co.il/models.aspx?sog=c-pclaptop&db239046=4643065",
  28: "https://www.zap.co.il/models.aspx?sog=c-pclaptop&db239046=239051",
  377: "https://www.zap.co.il/models.aspx?sog=c-pclaptop&db239046=8699937",
  215: "https://www.zap.co.il/models.aspx?sog=c-pclaptop&db239046=6114118",
  228: "https://www.zap.co.il/models.aspx?sog=c-brandpc&db252715=253782",
  230: "https://www.zap.co.il/models.aspx?sog=c-brandpc&db252715=252718",
  221: "https://www.zap.co.il/models.aspx?sog=c-allinonepc&db3389584=3389586",
  252: "https://www.zap.co.il/models.aspx?sog=c-brandpc&db252715=1201431",
  253: "https://www.zap.co.il/models.aspx?sog=c-brandpc&db252715=3958808",
  247: "https://www.zap.co.il/models.aspx?sog=c-allinonepc&db3389584=3421020",
  245: "https://www.zap.co.il/models.aspx?sog=c-allinonepc&db3389584=3958807",
  246: "https://www.zap.co.il/models.aspx?sog=c-allinonepc&db3389584=3421018",
  248: "https://www.zap.co.il/models.aspx?sog=c-brandpc&db252715=252716",
  249: "https://www.zap.co.il/models.aspx?sog=c-monitor",
};

const config = {
  user: "nayadnayad",
  password: "jh89h!83eb!h7ca0",
  server: "localhost",
  database: "nayadnayad",
  options: {
    encrypt: true, // For Azure SQL Database
    trustServerCertificate: true, // Change to false for production
  },
};

const categoryKeys = Object.keys(categories);
// connect to your database

const Categories = [
  { id: 0, category: "All" },
  {
    id: 3,
    category: "Lenovo mobiles",
  },
  {
    id: 5,
    category: "HP mobiles",
  },
  {
    id: 7,
    category: "DELL mobiles",
  },
  {
    id: 24,
    category: "ASUS laptops",
  },
  {
    id: 26,
    category: "Samsung mobiles",
  },
  {
    id: 330,
    category: "ACER mobiles",
  },
  {
    id: 344,
    category: "MSI Gaming Laptops",
  },
  {
    id: 28,
    category: "Apple mobiles",
  },
  {
    id: 377,
    category: "Gigabyte Gaming Laptops",
  },
  {
    id: 215,
    category: "Microsoft Surface",
  },
  {
    id: 228,
    category: "Lenovo stationary",
  },
  {
    id: 230,
    category: "Dell stationary",
  },
  {
    id: 221,
    category: "Dell All in one",
  },
  {
    id: 252,
    category: "Asus stationary",
  },
  {
    id: 253,
    category: "Stationary HP",
  },
  {
    id: 247,
    category: "Lenovo All in one",
  },
  {
    id: 245,
    category: "HP All in one",
  },
  {
    id: 246,
    category: "ASUS All in one",
  },
  {
    id: 248,
    category: "Apple All in one",
  },
  {
    id: 249,
    category: "computer screens",
  },
];
function saveProductToFile() {
  return new Promise((resolve, reject) => {
    let request = new sql.Request();
    const promises = [];
    for (let key of categoryKeys) {
      const promise = new Promise((innerResolve, innerReject) => {
        request.query(
          `SELECT DISTINCT T_Products.productid as proid, T_Products.name,T_Products.saleprice , T_Categories.catCode, T_Categories.parentId From T_Products JOIN T_Categories on T_Products.catcode = T_Categories.catCode WHERE T_Categories.catCode = ${key} OR T_Categories.parentId = ${key}`,
          async function (err, recordset) {
            if (err) {
              console.log(err);
              innerReject(err);
            } else {
              saveFile("./data-1/", key, recordset.recordset)
                .then(() => innerResolve())
                .catch((err) => innerReject(err));
            }
          }
        );
      });
      promises.push(promise);
    }
    Promise.all(promises)
      .then(() => {
        resolve();
      })
      .catch((err) => reject(err));
  });
}
// sql.connect(config, function (err) {
//   if (err) console.log(err);
//   else {
//     saveProductToFile()
//       .then(() => {
//         console.log("Successfullly get products from server");
//         for (cat of Categories) if (cat.id !== 0) saveSameProduct(cat.id);
//       })
//       .catch((err) => console.log(err));
//   }
// });

async function getSameProducts(id, getHigher = 0) {
  const data2 = await readFile(`./data-3/telemartData-${id}.json`);
  if (getHigher === "1")
    return data2.filter((item) => item.myPrice > item.lowPrice);
  return data2;
}

function updateProductPrices(products, percent) {
  const newResult = [];

  return new Promise((resolve, reject) => {
    const promises = products.map((res) => {
      return new Promise((resolve, reject) => {
        if (res.myPrice > res.lowPrice) {
          const request = new sql.Request();
          request.query(
            `UPDATE T_Products SET saleprice=${Math.floor(
              (res.lowPrice * percent) / 100
            )} WHERE productid=${res.proid}`,
            function (err, recordset) {
              if (err) reject(err);
              res.myPrice = Math.floor((res.lowPrice * percent) / 100);
              newResult.push(res);
              resolve();
            }
          );
        } else {
          newResult.push(res);
          resolve();
        }
      });
    });

    Promise.all(promises)
      .then(() => {
        console.log(newResult);
        resolve(newResult);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function updatePrice(percent, category) {
  return new Promise(async (resolve, reject) => {
    let result = [];
    console.log("Update price category----------------", category);
    if (category === "0") {
      for (cat of Categories) {
        if (cat.id !== 0) {
          let products = await getSameProducts(cat.id);
          updateProductPrices(products, percent).then((newResult) => {
            saveFile("./data-3/", cat.id, newResult);
          });
        }
      }
    } else {
      let products = await getSameProducts(category);
      updateProductPrices(products, percent).then((newResult) => {
        saveFile("./data-3/", category, newResult, "Updated successfully");
      });
    }
    console.log(result.length);
    resolve();
  });
}

function updateSelectedPrice(datas) {
  return new Promise(async (resolve, reject) => {
    try {
      for (cat of Categories) {
        if (cat.id !== 0) {
          let products = await getSameProducts(cat.id);
          const result = products.map((value) => {
            const found = datas.find((data) => data.proid === value.proid);
            if (found) {
              value.myPrice = found.updatePrice;
            }
            return value;
          });
          await saveFile("./data-3/", cat.id, result);
        }
      }
      for (data of datas) {
        let request = new sql.Request();
        await request.query(
          `UPDATE T_Products SET saleprice=${data.updatePrice} WHERE productid=${data.proid}`
        );
      }
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

app.get("/category", (req, res) => {
  res.send(Categories);
});
app.get("/:id/:higher", async (req, res) => {
  let result = [];
  if (req.params.id == 0) {
    for (cat of Categories) {
      if (cat.id !== 0) {
        const products = await getSameProducts(cat.id, req.params.higher);
        result = result.concat(products);
      }
    }
  } else {
    console.log(req.params.higher);
    result = await getSameProducts(req.params.id, req.params.higher);
  }
  //console.log(result);
  res.json({ products: result });
});

app.post("/update/:category", (req, res) => {
  updatePrice(req.body.percent, req.params.category).then(() => {
    saveProductToFile().then(() => res.json("Success"));
  });
});

app.post("/update/selected/price", (req, res) => {
  updateSelectedPrice(req.body).then(() => {
    saveProductToFile().then(() => res.json("Success"));
  });
});
app.get("/items", function (req, res) {
  res.json(data);
});

app.get("/setHigh", async function (req, res) {
  let result = [];
  for (cat of Categories) {
    if (cat.id !== 0) {
      const products = await getSameProducts(cat.id, "0");
      result = result.concat(products);
    }
  }
  for (res of result) {
    let request = new sql.Request();
    request.query(
      `UPDATE T_Products SET saleprice=${Math.floor(
        res.lowPrice * 2
      )} WHERE productid=${res.proid}`,
      function (err, recordset) {
        if (err) console.log(err);
      }
    );
  }
});
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});


app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

const keys = Object.keys(categories);

const getZapSite = async () => {
  for (key of keys) {
    await scrapeDynamicWebpage2(categories[key], key);
    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<first>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
  }
  const m = new Date();
  const dateString =
    m.getFullYear() +
    "/" +
    ("0" + (m.getMonth() + 1)).slice(-2) +
    "/" +
    ("0" + m.getDate()).slice(-2) +
    " " +
    ("0" + m.getHours()).slice(-2) +
    ":" +
    ("0" + m.getMinutes()).slice(-2) +
    ":" +
    ("0" + m.getSeconds()).slice(-2);
  console.log(`Successfully get products from Zap site. ****${dateString}****`);
};
getZapSite();
setTimeout(() => {
  getZapSite();
}, 1000 * 60 * 30);
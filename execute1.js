const sql = require("mssql");

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

sql.connect(config, function (err) {
  if (err) console.log(err);
  else {
    let request = new sql.Request();
    request.query(
      "SELECT * from T_Products WHERE catcode=26",
      async function (err, recordset) {
        if (err) {
          console.log(err);
        } else {
          console.log(recordset.recordset);
        }
      }
    );
    // request.query(
    //   `SELECT MAX(productid) as pid from T_Products`,
    //   async function (err, recordset) {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       console.log(recordset.recordset[0].pid);
    //       request.query(
    //         `INSERT INTO T_Products (productid, name, catcode) VALUES (${
    //           recordset.recordset[1].pid + 1
    //         }, 'abababababab', '26')`,
    //         async function (err, recordset) {
    //           if (err) {
    //             console.log(err);
    //           } else {
    //             console.log("successfully added", recordset);
    //           }
    //         }
    //       );
    //     }
    //   }
    // );
  }
});

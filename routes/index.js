var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser')
const XlsxPopulate = require('xlsx-populate'); // use this
swaggerUi = require('swagger-ui-express'),
swaggerDocument = require('../swagger.json');



/*
json structure:
{
  columnsBold:true\false
  columns:[col1,col2,col3],
  array of arrays=== rows:[row1,row2,row3]
}

aoa = aray of arays = [row1,row2,row3,...] =example= [row1=[1,2,3],row2=[4,5,6],...]

*/

let json2workbook = (json)=>{
  return XlsxPopulate.fromBlankAsync()
  .then((workbook)=>{

    let sheet = workbook.sheet("Sheet1");

    for(let j = 0;j<json.columns.length;j++){
     sheet.row(1).cell(j+1).value(json.columns[j])
     sheet.row(1).cell(j+1).style("bold",json.columnsBold);
    }

    for(let i = 0;i<json.rows.length;i++){
      for(let j =0;j<json.rows[i].length;j++){
        let cell = sheet.row(i+2).cell(j+1)
        cell.value(json.rows[i][j])
    }}
    return workbook.outputAsync();
  })
  .catch((err)=>{
    console.log(err);
  });
}

router.use(bodyParser.json({ type: 'application/*+json' }));
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
router.post('/', function(req, res, next) {
  if (!req.body) return res.sendStatus(400)
  //set mime type
  res.setHeader("content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  //set file name
  res.attachment("output.xlsx");
  //cors
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, api_key, Authorization',
  });

  json2workbook(req.body)
  .then(data=>{
  res.send(data);
  });
});

module.exports = router;

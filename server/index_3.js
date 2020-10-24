var express = require("express"),
    fs = require("fs"),
    path = require("path"),
    multiparty = require('multiparty'),
    cors = require('cors'),
    app = express(),
    port = process.env.SERVER_PORT || 8000;

const multer=require('multer');


var storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb( null, 'static/images/')
        },
        filename: function (req, file, cb) {
          const str = file.originalname.substr(file.originalname.indexOf("."))
        //   cb(null, file.fieldname + '-' + Date.now()+'.'+arry)
          cb( null, req.session.accountCheck + str)
        },
})
var upload = multer({ storage: storage });

app.use(cors({
      origin:['http://localhost:8080'],
      methods:['GET','POST'],
      alloweHeaders:['Conten-Type', 'Authorization']
}));


app.listen(port, () => {
  // console.log(port);
  console.log(`Server Started-w. http://localhost:${port}`);
});

// routes
app.use(express.static(__dirname + '/public'));
app.post("/uploads", upload,(req, res, next) => {
    console.log(req);


});
app.delete("/uploads/:uuid", onDeleteFile);

function onUpload(req,res,next){
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    var partIndex = fields.qqpartindex;
    console.log(files);

    // text/plain is required to ensure support for IE9 and older
    res.set("Content-Type", "text/plain");

    // if (partIndex == null) {
    //     onSimpleUpload(fields, files[fileInputName][0], res);
    // }
    // else {
    //     onChunkedUpload(fields, files[fileInputName][0], res);
    // }
});
  console.log("onUpload");
}

function onDeleteFile(){
  console.log('onDeleteFile')
}

function onSimpleUpload(){

}



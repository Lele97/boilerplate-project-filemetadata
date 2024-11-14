const express = require('express');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const path = require('path');

const app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

class File {
  constructor(name, type, size) {
    this.name = name;
    this.type = type;
    this.size = size;
  }
}

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const storage = multer.diskStorage({
  destination: './upload',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 }, // Limit file size to 2MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('upfile');

// Check file type function
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/; // Allowed extensions
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

app.post('/api/fileanalyse', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).send({ message: err });
    } else {
      if (req.file == undefined) {
        res.status(400).send({ message: 'No file selected!' });
      } else {
        const buffer = Buffer.alloc(4)
        buffer.writeUInt32BE(req.file.size)
        const sizeInByte = buffer.toString()
        const file = new File(req.file.filename, req.file.mimetype, sizeInByte)
        res.json(file);
      }
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port);
});

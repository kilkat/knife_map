const express = require('express');
const fs = require('fs');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const { sequelize } = require("./models");
const report = require("./models/report");

const app = express();
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const filePath = path.join(__dirname, 'data/coordinate.json');

const port = 8001;

app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  res.render('index', { coordinates: data });
});

app.use(express.urlencoded({ extended: true }));


app.get('/report', (req, res) => {
  res.render('report');
})

app.post('/report', async (req, res) => {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const { option, location, year, month, day, sourceUrl } = req.body;
  const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  console.log(clientIP);

  try {
    // Create a new Report instance
    report.create({
      ipAddress: clientIP,
      option: option,
      location: location,
      date: date,
      sourceUrl: sourceUrl
    });

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('제보를 받는 동안 오류가 발생했습니다. 트위터로 문의해주세요. @knifemap');
  }
});


app.listen(port, () => {
    
  console.log(`Server running at http://localhost:${port}`);
});

sequelize.sync({force: false})
    .then(() => {
        console.log("데이터베이스 연결 성공");
        
    })
    .catch((err) => {
        console.error(err);
    });
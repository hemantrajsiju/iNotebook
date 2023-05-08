const express = require('express');
const connectDB = require('./db');
var cors = require('cors');


connectDB();

const app = express();

app.use(cors());
app.use(express.json());

//Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.get('/', (req, res) => {
  res.send('Hello DB Admin Hemant!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`iNotebook backend Server running on port ${PORT}`)
);


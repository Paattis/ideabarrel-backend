import express from 'express';
const app = express();

app.get('/', (req, res) => {
  res.send('Hello world')
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening to on port ${port}`))
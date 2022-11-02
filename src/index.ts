//import express = require('express');
import app from "./app";
const port = process.env.PORT || 3000;

app.listen(port, (): void =>
  console.log(`Backend listening to on port ${port}`)
);

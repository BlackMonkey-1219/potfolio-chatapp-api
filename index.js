import express from "express";

const PORT = 5000;
const app = express();
app.use(express.json());

app.listen(5000, () => {
  console.log(`SERVER LISTENING ON PORT: ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("CONNECTION ESTABLISHED!");
  console.log(req.ip);
});

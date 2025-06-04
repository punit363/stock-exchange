import express from "express";
import { order } from "./controller/order";
const app = express();
const port = 3001;

app.use(express.json());
app.get("/", (req, res) => {
  res.json({ message: "Hello From Exchange!" });
});

app.post("/api/v1/order", order);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

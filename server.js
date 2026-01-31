const express = require("express");
const app = express();
const PORT = 3000;
const journalRoute = require("./routes/journal");

app.use(express.json());
app.use(express.static("public"));
app.use("/journal", journalRoute);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

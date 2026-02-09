import "dotenv/config";
import app from "./server";

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});

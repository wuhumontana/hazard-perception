import app from "./src/App.js";
import * as db from "./src/data/db.js";
import { scheduleSyncREDCap } from "./src/util/redcap.js";
db.connect(process.env.DB_URI);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Hazard Perception API at http://localhost:${PORT}/`);
  scheduleSyncREDCap();
});

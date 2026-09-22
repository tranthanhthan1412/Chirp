import "dotenv/config";
import "./app.js";
import connectDB from "./libs/db.js";
import { server } from "./socket/index.js";

await connectDB();
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

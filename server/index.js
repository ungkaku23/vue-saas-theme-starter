const app = require("express")();
const server = require("http").Server(app);
const path = require("path");
const io = require("./io");
io.attach(server);
const port = process.env.PORT || 3001;
//Import Function To register Our Routes in App
const { registerRoutes } = require("./routes");
//Import Function To Setting Our Environment
const { setEnvironment } = require("./config/env.js");
//Import DB Config
const { connectToDB } = require("./config/db");
var compression = require("compression");
// compress all responses
app.use(compression());

setEnvironment(app);
connectToDB();
registerRoutes(app);

// All non-API requests made to the server, for example, http://www.homepage.com/,
// will hit this request, which just returns the main layout, html file
app.get("*", (req, res) => {
  if (process.env.NODE_ENV != "production") {
    return res.send("Running server in development mode.");
  } else {
    // Returns the main index file in production environment
    return res.sendFile(path.join(__dirname, "../dist/index.html"));
  }
});

server.listen(port, () => {
  console.log(
    `Boostack  app listening on port ${port} in ` +
      process.env.NODE_ENV +
      " mode!"
  );
});

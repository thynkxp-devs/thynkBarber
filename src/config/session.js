const session = require("express-session");
const MongoStore = require("connect-mongo");

function sessionMiddleware() {
  const mongoUrl = process.env.MONGODB_URI;
  const secret = process.env.SESSION_SECRET || "dev_secret";

  return session({
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 6 // 6h
      // secure: true // produção com HTTPS
    },
    store: MongoStore.create({ mongoUrl })
  });
}

module.exports = { sessionMiddleware };

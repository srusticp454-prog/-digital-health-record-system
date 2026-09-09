const http = require("http");
const email = "test" + Date.now() + "@example.com";
const data = JSON.stringify({ name: "Test", email, password: "password123", role: "patient", hospital: "" });
const req = http.request({ hostname: "localhost", port: 5000, path: "/api/auth/register", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
  let body = "";
  res.on("data", (c) => (body += c));
  res.on("end", () => console.log("Status:", res.statusCode, "Body:", body));
});
req.on("error", (e) => console.error(e));
req.write(data);
req.end();
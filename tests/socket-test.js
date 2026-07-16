import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJwdWJsaWNJZCI6ImYxMmJkODZiLWViN2QtNGMyZi04NTViLWZkMzQ5YTAzMWQyMyIsInVzZXJuYW1lIjoibmFydXRvIiwiZW1haWwiOiJuYXJ1dG9AdGVzdC5jb20iLCJpYXQiOjE3ODQxNTkwODQsImV4cCI6MTc4NDE1OTk4NCwiYXVkIjoiU2hhZG93RG9ja1VzZXJzIiwiaXNzIjoiU2hhZG93RG9jayJ9.Wi3U9w7y6I5BmlrFcQxZCREXfQEOwfFpr0PhJdd4358"
    }
});

socket.on("connect", () => {
    console.log("✅ Connected");
    console.log(socket.id);
});

socket.on("connect_error", (err) => {
    console.log("❌", err.message);
});

socket.on("disconnect", () => {
    console.log("Disconnected");
});
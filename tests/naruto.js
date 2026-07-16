import { io } from "socket.io-client";

const USER = "naruto";   // Naruto in naruto.js

const socket = io("http://localhost:5000", {
    transports: ["websocket"],

    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJwdWJsaWNJZCI6ImYxMmJkODZiLWViN2QtNGMyZi04NTViLWZkMzQ5YTAzMWQyMyIsInVzZXJuYW1lIjoibmFydXRvIiwiZW1haWwiOiJuYXJ1dG9AdGVzdC5jb20iLCJpYXQiOjE3ODQxNTkyOTcsImV4cCI6MTc4NDE2MDE5NywiYXVkIjoiU2hhZG93RG9ja1VzZXJzIiwiaXNzIjoiU2hhZG93RG9jayJ9.CoqyZj2LYrfiBkhEYYHBwfGGI6zS7W74zCBa8BIQDHY"
    }
});

socket.on("connect", () => {
    console.log(`✅ ${USER} Connected`);
    console.log(socket.id);
});

socket.on("disconnect", (reason) => {
    console.log(`${USER} disconnected:`, reason);
});

socket.on("connect_error", (err) => {
    console.log(`${USER} connect error:`, err.message);
});
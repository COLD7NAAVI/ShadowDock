import { io } from "socket.io-client";

const USER = "naruto";   // Naruto in naruto.js

const socket = io("http://localhost:5000", {
    transports: ["websocket"],

    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJwdWJsaWNJZCI6ImYxMmJkODZiLWViN2QtNGMyZi04NTViLWZkMzQ5YTAzMWQyMyIsInVzZXJuYW1lIjoibmFydXRvIiwiZW1haWwiOiJuYXJ1dG9AdGVzdC5jb20iLCJpYXQiOjE3ODQxNjQxNDAsImV4cCI6MTc4NDE2NTA0MCwiYXVkIjoiU2hhZG93RG9ja1VzZXJzIiwiaXNzIjoiU2hhZG93RG9jayJ9._fk7TkYbSIt5MNI0_L7Ihbtxpr9o_urARrf_eET3iO4"
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
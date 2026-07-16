import { io } from "socket.io-client";

const USER = "ghost";   

const socket = io("http://localhost:5000", {
    transports: ["websocket"],

    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJwdWJsaWNJZCI6ImI0NzZmMjMxLTZjMjMtNDhjMS1iZTZkLWQxOWQzYmVlMWVjZSIsInVzZXJuYW1lIjoiZ2hvc3QiLCJlbWFpbCI6Imdob3N0QHRlc3QuY29tIiwiaWF0IjoxNzg0MTY0MTEwLCJleHAiOjE3ODQxNjUwMTAsImF1ZCI6IlNoYWRvd0RvY2tVc2VycyIsImlzcyI6IlNoYWRvd0RvY2sifQ.rEBM-LXuhIi7ta0LB9wYT9Fi4HY-YgpDFW4-2OmCAnY"
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
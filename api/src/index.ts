import app from "./server.ts";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`App is litening to port http://localhost:${PORT}`);
});

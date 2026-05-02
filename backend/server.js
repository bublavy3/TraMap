import express from "express"

const app = express()
const PORT = 3000

// TODO make real API later
app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello from TraMap backend" })
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
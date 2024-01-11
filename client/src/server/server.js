// create an express server
const express = require("express");
const app = express();
app.use(express.json());

const testData = require("./events.json");
const fs = require("fs");
const path = require("path");

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the server" });
});

app.listen(3001, () => {
    console.log("The server is running on port 3001");
});


// ***************** EVENTS *****************

// Create a new event
app.post("/api/events", (req, res) => {
    console.log(req.body);
    const newEvent = { id: testData.length + 1, ...req.body };
    // add the new event to the database (events.json)
    testData.push(newEvent);
    fs.writeFileSync(path.join(__dirname, './events.json'), JSON.stringify(testData, null, 2));
    
    // return the new event
    res.json({ message: "Event created" });
});

// Get all events
app.get("/api/events", (req, res) => {
    if (req.body.limit && req.body.limit < testData.length) {
        return res.json(testData.slice(0, req.body.limit));
    } else {
        return res.json(testData);
    }
});

// Get specific event
app.get("/api/events/:id", (req, res) => {
    const event = testData.find(event => event.id === parseInt(req.params.id));
    if (!event) {
        return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
});

// Update specific event
app.patch("/api/events/:id", (req, res) => {
    const event = testData.find(event => event.id === parseInt(req.params.id));
    if (!event) {
        return res.status(404).json({ message: "Event not found" });
    }
    if (!req.body.eventName || !req.body.description || !req.body.location || !req.body.startDate || !req.body.endDate) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }
    // update the event assume that not all fields are updated
    event.eventName = req.body.eventName;
    event.description = req.body.description;
    event.location = req.body.location;
    event.startDate = req.body.startDate;
    event.endDate = req.body.endDate;
        
    fs.writeFileSync(path.join(__dirname, './events.json'), JSON.stringify(testData, null, 2));
    res.json({ message: "Event updated" });
});

// Delete specific event
app.delete("/api/events/:id", (req, res) => {
    const event = testData.find(event => event.id === parseInt(req.params.id));
    if (!event) {
        return res.status(404).json({ message: "Event not found" });
    }
    const index = testData.indexOf(event);
    testData.splice(index, 1);
    fs.writeFileSync(path.join(__dirname, './events.json'), JSON.stringify(testData, null, 2));
    res.json({ message: "Event deleted" });
});


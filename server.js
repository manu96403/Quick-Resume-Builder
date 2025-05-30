const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
const port = 3000;

//const users = {};      // username -> passwordHash
const usersFile = path.join(__dirname, 'users.json');
let users = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile)) : {};
const sessions = {};   // sessionId -> username
const resumes = {};    // username -> resumeData

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(express.static('res')); // Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'res')));


// Helper functions
function generateSessionId() {
    return Math.random().toString(36).substring(2);
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Serve the registration and login form (index page)
// app.get('/create.html', (req, res) => {
//     res.sendFile(path.join(__dirname,'create.html'));
// });
//app.get('/resume.html', (req, res) => {
    //res.sendFile(path.join(__dirname, 'resume.html'));
//});
// Register
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users[username]) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    users[username] = hashPassword(password);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    const sessionId = generateSessionId();
    sessions[sessionId] = username;
    res.cookie('sessionId', sessionId, { httpOnly: true });
    res.json({ success: true });
});

// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const storedHash = users[username];
    if (storedHash && storedHash === hashPassword(password)) {
        return res.status(401).json({ success: false, message: 'Invalid Credentials' })
    }
    const sessionId = generateSessionId();
    sessions[sessionId] = username;
    res.cookie('sessionId', sessionId, { httpOnly: true });
    res.json({ success: true });
});
//templates.html
// app.get('/templates.html', (req, res) => {
//     res.sendFile(path.join(__dirname, 'templates.html'));
// });
//create.html
// app.get('/create.html', (req, res) => {
//     res.sendFile(path.join(__dirname, 'create.html'));
// });
//resume.html
// app.get('/resume.html', (req, res) => {
//     res.sendFile(path.join(__dirname, 'resume.html'));
// });



// Resume submission
app.post('/submit', (req, res) => {
    const data = req.body;

    // Generate recommendation
    const recs = [];

    if (data.category === "student") {
        if (data.studentLevel === "ssc") {
            if (data.sscSkills) recs.push(Has foundational skills in ${data.sscSkills}.);
            if (data.sscRole) recs.push(Aims to apply for the role of ${data.sscRole}.);
            if (data.schoolName) recs.push(Completed schooling from ${data.schoolName}.);
            if (data.sscGrade) recs.push(Achieved ${data.sscGrade} in SSC/CBSE.);
        } else if (data.studentLevel === "intermediate") {
            if (data.interSkills) recs.push(Has intermediate knowledge in ${data.interSkills}.);
            if (data.interRole) recs.push(Interested in the role of ${data.interRole}.);
            if (data.interCollege) recs.push(Pursued 12th from ${data.interCollege}.);
            if (data.interCourse) recs.push(Course specialization includes ${data.interCourse}.);
        } else if (data.studentLevel === "graduation") {
            if (data.gradSkills) recs.push(Possesses technical skills in ${data.gradSkills}.);
            if (data.gradCollege) recs.push(Graduated from ${data.gradCollege}.);
            if (data.juniorCollege) recs.push(Completed junior college from ${data.juniorCollege}.);
            if (data.gradProjects) recs.push(Worked on key projects: ${data.gradProjects}.);
            if (data.gradRole) recs.push(Looking to begin a career as ${data.gradRole}.);
        }
    }

    if (data.category === "fresher") {
        if (data.fresherSkills) recs.push(Equipped with skills in ${data.fresherSkills}.);
        if (data.fresherInternship) recs.push(Internship experience: ${data.fresherInternship}.);
        if (data.fresherCollege) recs.push(Graduated from ${data.fresherCollege}.);
        if (data.fresherRole) recs.push(Interested in starting as ${data.fresherRole}.);
    }

    if (data.category === "working") {
        if (data.workSkills) recs.push(Skilled in ${data.workSkills}.);
        if (data.workRole) recs.push(Currently working as ${data.workRole}.);
        if (data.workCollege) recs.push(Graduated from ${data.workCollege}.);
        if (data.workExperience) recs.push(Has ${data.workExperience} years of professional experience.);
    }

    if (recs.length > 5) recs.length = 5;
    data.recommendation = recs.join(" ");

    if (data.customText) {
        data.recommendation += " " + data.customText;
    }
    const filePath = path.join(__dirname, 'resume.json');
    // Save the resume data to a file
    fs.writeFile('resume.json', JSON.stringify(data, null, 2), err => {
        if (err) {
            console.error("Failed to save resume:", err);
            return res.status(500).send("Error saving resume");
        }

        // ✅ Return success response (DON’T redirect!)
        res.status(200).json({ success: true });
    });
});


// Serve resume data
app.get('/resume-data', (req, res) => {
    fs.readFile('resume.json', 'utf8', (err, jsonData) => {
        if (err) {
            res.status(404).send('Resume not found');
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.send(jsonData);
        }
    });
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'res', 'public.html'));
});
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'res', 'login.html'));
});

app.get('/templates.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'res', 'templates.html'));
});

app.get('/create.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'res', 'create.html'));
});

app.listen(port, () => {
    console.log(Server running at http://localhost:${port});
});

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const resumeForm = document.getElementById('resumeForm');
    const resumeSection = document.getElementById('resume');

    // Get template from URL
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get("template");
    if (templateId) {
        document.body.classList.add(`template-${templateId}`);
    }

    // Fetch resume data
    document.addEventListener("DOMContentLoaded", async () => {
        try {
            const res = await fetch('/resume-data');
            if (!res.ok) throw new Error('Resume data not found');
            const data = await res.json();

            // Apply background template
            if (data.template) {
                document.body.classList.add(`template-${data.template}`);
            }
            document.getElementById('name').textContent = data.name || '';
            document.getElementById('email').textContent = data.email || '';
            document.getElementById('phone').textContent = data.phone || '';
            document.getElementById('address').textContent = data.address || '';
            document.getElementById('role').textContent = data.gradRole || data.interRole || data.workRole || data.fresherRole || '';
            document.getElementById('recommendation').textContent = data.recommendation || '';
            const eduDiv = document.getElementById('education');
            const eduFields = [
                { name: 'schoolName', course: '', percent: 'sscGrade' },
                { name: 'interCollege', course: 'interCourse', percent: 'interGrade' },
                { name: 'gradCollege', course: 'gradCourse', percent: 'gradPercent' },
                { name: 'fresherCollege', course: 'fresherCourse', percent: 'fresherPercent' },
                { name: 'workQual', course: 'workCourse', percent: '' }
            ];
            eduFields.forEach(f => {
                if (data[f.name]) {
                    const p = document.createElement('p');
                    p.textContent = `${data[f.name]} - ${data[f.course] || ''} ${f.percent && data[f.percent] ? `(${data[f.percent]})` : ''}`;
                    eduDiv.appendChild(p);
                }
            });
            const interestsList = document.getElementById('interests');
            const rawInterests = data.interests || data.gradInterests || data.fresherInterests || data.workInterests || '';
            rawInterests.split(',').forEach(interest => {
                if (interest.trim()) {
                    const li = document.createElement('li');
                    li.textContent = interest.trim();
                    interestsList.appendChild(li);
                }
            });

            // Internship
            if (data.fresherInternship) {
                document.getElementById('internship-section').style.display = 'block';
                document.getElementById('internship').textContent = data.fresherInternship;
            }

            // Salary
            if (data.workSalary) {
                document.getElementById('salary-section').style.display = 'block';
                document.getElementById('salary').textContent = data.workSalary;
            }

        } catch (err) {
            console.error("Error loading resume:", err);
            document.querySelector(".resume-container").innerHTML = "<h2>Failed to load resume data.</h2>";
        }
    });
    //create
    //recommended text

    const createForm = document.getElementById("resumeForm");
    if (createForm) {
        createForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(createForm);
            const json = {};

            for (let [key, value] of formData.entries()) {
                json[key] = value.trim();
            }

            // Generate recommended text
            const recs = [];
            if (json.category === "student") {
                if (json.studentLevel === "ssc") {
                    if (json.sscSkills) recs.push(`Has foundational skills in ${json.sscSkills}.`);
                    if (json.sscRole) recs.push(`Aims to apply for the role of ${json.sscRole}.`);
                    if (json.schoolName) recs.push(`Completed schooling from ${json.schoolName}.`);
                    if (json.sscGrade) recs.push(`Achieved ${json.sscGrade} in SSC/CBSE.`);
                } else if (json.studentLevel === "intermediate") {
                    if (json.interSkills) recs.push(`Has intermediate knowledge in ${json.interSkills}.`);
                    if (json.interRole) recs.push(`Interested in the role of ${json.interRole}.`);
                    if (json.interCollege) recs.push(`Pursued 12th from ${json.interCollege}.`);
                    if (json.interCourse) recs.push(`Course specialization includes ${json.interCourse}.`);
                } else if (json.studentLevel === "graduation") {
                    if (json.gradSkills) recs.push(`Possesses technical skills in ${json.gradSkills}.`);
                    if (json.gradCollege) recs.push(`Graduated from ${json.gradCollege}.`);
                    if (json.gradJuniorcollege) recs.push(`Completed junior college from ${json.gradJuniorcollege}.`);
                    if (json.gradProjects) recs.push(`Worked on key projects: ${json.gradProjects}.`);
                    if (json.gradRole) recs.push(`Looking to begin a career as ${json.gradRole}.`);
                }
            } else if (json.category === "fresher") {
                if (json.fresherSkills) recs.push(`Equipped with skills in ${json.fresherSkills}.`);
                if (json.fresherInternship) recs.push(`Internship experience: ${json.fresherInternship}.`);
                if (json.fresherCollege) recs.push(`Graduated from ${json.fresherCollege}.`);
                if (json.fresherRole) recs.push(`Interested in starting as ${json.fresherRole}.`);
            } else if (json.category === "working") {
                if (json.workSkills) recs.push(`Skilled in ${json.workSkills}.`);
                if (json.workRole) recs.push(`Currently working as ${json.workRole}.`);
                if (json.workCollege) recs.push(`Graduated from ${json.workCollege}.`);
                if (json.workExperience) recs.push(`Has ${json.workExperience} years of professional experience.`);
            }

            if (recs.length > 5) recs.length = 5;
            json.recommendation = recs.join(" ");

            // Add selected template to the data
            const templateId = new URLSearchParams(window.location.search).get("template");
            if (templateId) {
                json.template = `template${templateId}`;
            }

            // Update recommendation box
            const recBox = document.getElementById("recommendation");
            if (recBox) recBox.value = json.recommendation;

            const res = await fetch("/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(json)
            });

            if (res.ok) {
                window.location.href = `/template${templateId}.html`;
            } else {
                alert("Failed to submit resume.");
            }
        });
    }


    //login
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = registerForm.username.value;
            const password = registerForm.password.value;
            const res = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            alert(await res.text());
            if (res.ok) window.location.href = 'templates.html';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;
            const res = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            alert(await res.text());
            if (res.ok) window.location.href = 'templates.html';
        });
    }

    window.downloadPDF = function () {
        const printWindow = window.open('', '', 'height=700,width=900');
        printWindow.document.write('<html><head><title>Resume</title>');
        printWindow.document.write('<style>body{font-family:Arial;padding:20px;}h1,h2,h3,p{margin:0 0 10px;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(document.getElementById('resume').innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }
    /* template.js */
    const templateGrid = document.getElementById('templateGrid');
    const selectedTemplateInput = document.getElementById('selectedTemplate');
    const nextButton = document.getElementById('nextButton');

    const images = [
        "temp_img/temp1.jpg",
        "temp_img/temp2.jpg",
        "temp_img/temp3.jpg",
        "temp_img/temp4.jpg",
        "temp_img/temp5.jpg",
        "temp_img/temp6.jpg",
    ];


    window.selectTemplate = function (templateId) {
        // Save selected template in local storage
        localStorage.setItem('selectedTemplate', templateId);
        window.location.href = `create.html?template=${templateId}`;
    }
    window.togglePassword = function (passwordFieldId) {
        var passwordField = document.getElementById(passwordFieldId);
        if (passwordField.type === "password") {
            passwordField.type = "text";
        } else {
            passwordField.type = "password";
        }
    };
});

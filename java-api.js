const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const cors = require("cors");
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Route for compiling and running Java code
app.post('/compile-run-java', (req, res) => {
    const code = req.body.code;

    if (!code) {
        return res.status(400).json({ success: false, error: 'No code provided.' });
    }

    // Write code to a temporary Java file
    const fileName = 'temp.java';
    fs.writeFileSync(fileName, code);

    // Compile the Java file
    exec(`javac ${fileName}`, (error, stdout, stderr) => {
        if (error) {
            fs.unlinkSync(fileName); // Delete the temporary Java file
            return res.json({ success: false, error: stderr });
        }

        // Execute the compiled Java file
        exec(`java ${fileName.substring(0, fileName.lastIndexOf('.'))}`, (error, stdout, stderr) => {
            fs.unlinkSync(fileName); // Delete the temporary Java file
            if (error) {
                return res.json({ success: false, error: stderr });
            }
            return res.json({ success: true, output: stdout });
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

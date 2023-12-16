#!/usr/bin/env node
const program = require("commander");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const express = require("express");
const chokidar = require("chokidar");
const { spawn } = require("child_process");

program
  .version("0.1.0")
  .description(
    "Generate HTML, CSS, and JavaScript boilerplate with live server"
  );

program
  .command("generate <projectName>")
  .alias("g")
  .description("Generate boilerplate files for a new project")
  .action((projectName) => {
    const projectDir = path.join(process.cwd(), projectName);
    fs.mkdirSync(projectDir);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${projectName}</title>
          <link rel="stylesheet" type="text/css" href="style.css">
        </head>
        <body>
          <h1>Hello world!</h1>
          <script src="script.js"></script>
          <!-- Remove this if you don't want live reload -->
          <script src="liveReload.js"></script>
        </body>
      </html>
    `;

    const cssContent = `
      body {
        font-family: Arial, sans-serif;
      }
    `;

    const jsContent = `
      console.log('Hello, ${projectName}!');
    `;

    const liveReloadScript = `
      // Remove this if you don't want live reload
      // This pings the server every 1 second (the /version route) and reloads the page if the version number has changed
      // The first time the page loads, the version number is the one fetched from the server
    
      var ver = 0;
    
      fetch("/version").then((res) => {
        res.text().then((text) => {
          ver = parseInt(text);
        });
      });
    
      setInterval(() => {
        fetch("/version").then((res) => {
          res.text().then((text) => {
            if (parseInt(text) !== ver) {
              window.location.reload();
            }
          });
        });
      }, 1000);
    `;
  

    fs.writeFileSync(path.join(projectDir, "index.html"), htmlContent);
    fs.writeFileSync(path.join(projectDir, "style.css"), cssContent);
    fs.writeFileSync(path.join(projectDir, "script.js"), jsContent);
    fs.writeFileSync(path.join(projectDir, "liveReload.js"), liveReloadScript);

    console.log(`Boilerplate generated for ${projectName}`);
  });

program
  .command("serve <projectName>")
  .alias("s")
  .description("Start a live server for the project")
  .action((projectName) => {
    var ver = 1;
    const projectDir = path.join(process.cwd(), projectName);
    const app = express();
    app.use(express.static(projectDir));

    const server = app.listen(3000, () => {
      console.log(
        `Live server started for ${projectName} at http://localhost:3000`
      );

      spawn("npm", ["run", "start"], { stdio: "inherit", shell: true });
    });

    // Create a new route to display the version number
    app.get("/version", (req, res) => {
      res.send(ver.toString());
    });

    const watcher = chokidar.watch(projectDir);

    watcher.on("change", () => {
      console.log("Detected changes. Reloading...");
      server.close();
      server.listen(3000);
      ver += 1;
      console.log("Reloading complete.");
    });
  });

program.parse(process.argv);

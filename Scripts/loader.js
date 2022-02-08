const { exec } = require("child_process");
const path = require("path");
const fsPromises = require("fs/promises");
const { argv } = require("process");

if(argv.length < 3){
    throw new Error("Expected a filepath to a json file containing an array with commands to execute!");
}

async function loadCommands(filePath){
    const resolvedPath = path.resolve(process.cwd(), filePath);

    const json = await fsPromises.readFile(resolvedPath) + "";

    const commands = JSON.parse(json);

    if(!Array.isArray(commands)){
        throw new Error("Expected file '" + filePath + "' to be an json array!");
    }

    return commands;
}

async function main(){
    const commands = await loadCommands(argv[2]);
    
    for(let i = 0; i < commands.length; i++){
        await new Promise((resolve, reject) => {
            let command = commands[i];
            if(Array.isArray(command)){
                command = command.join(" ");
            }

            console.log();
            console.log("[loader.js] executing: '" + command + "'");
            console.log();

            const commandProcess = exec(command, (error, stdout, stderr) => {
                if(error != null){
                    console.log("Error during command! (Index: " + i + ")");
                    console.error(error);

                    if(stdout){
                        console.warn("StdOut:");
                        console.error(stdout);
                    }
                    if(stderr){
                        console.warn("StdErr:");
                        console.error(stderr);
                    }

                    reject(error);
                    throw error;
                }

                resolve();
            });

            commandProcess.stdout.setEncoding("utf8");
            commandProcess.stdout.on("data", data => {
                process.stdout.write(data);
            });

            commandProcess.stderr.setEncoding("utf8");
            commandProcess.stderr.on("data", data => {
                process.stdout.write(data);
            });
        });
    }
}

main();
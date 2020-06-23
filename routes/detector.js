var express = require('express');
const spawn = require("child_process").spawn;
var Promise = require('promise');
const config = require('../config.json');
var fs = require('fs');

var router = express.Router();

function run_first_cmfd(imagePath) {
    return new Promise(function (fullfill, reject) {
        const pyprog = spawn('python', [config.first_python_script_path_cmfd, imagePath]);
        pyprog.stdout.on('data', function (data) {
            fullfill(data.toString().trim());
        });

        pyprog.stderr.on('data', (data) => {
            reject(data.toString());
        });
    });

}

function checkExistsWithTimeout(filePath, timeout) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            fs.access(filePath, fs.constants.R_OK, function (err) {
                if (!err) {
                    resolve();
                }
                else{
                    reject(new Error('File did not exists and was not created during the timeout.'));
                }
            });
        }, timeout);
    });
}

router.post('/', async function (req, res, next) {
    if (!req.files || !req.files.suspectedImage) {
        return res.status(400).send('No files were uploaded.');
    }

    try{
        let suspectedImage = req.files.suspectedImage;
        let analyzedImagePath = await run_first_cmfd(suspectedImage.tempFilePath);
        await checkExistsWithTimeout(analyzedImagePath, 500);
        res.sendFile(analyzedImagePath);
    }
    catch(error){
        res.status(500).end('Server Error');
    }
    // TODO: delete temp files: suspectedImage, analyzedImagePath
});

module.exports = router;

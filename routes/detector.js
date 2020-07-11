var express = require('express');
const spawn = require("child_process").spawn;
var Promise = require('promise');
const config = require('../config.json');
var fs = require('fs');
var path = require('path');

var router = express.Router();
const detection_result_public_folder = "images\\algo_res";
const script_output_path = path.join(process.cwd(), "public", detection_result_public_folder);

function run_cmfd_algo(algo_id, imagePath) {
    return new Promise(function (fullfill, reject) {
        let script_path = algo_id == '1' ? config.first_python_script_path_cmfd : config.second_python_script_path_cmfd;
        const pyprog = spawn('python', ['-W ignore', script_path, imagePath, script_output_path]);
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
        let algo_id;
        if(!req.body.detection_method || req.body.detection_method == '1'){
            algo_id = '1';
        }
        else if (req.body.detection_method == '2'){
            algo_id = '2'
        }
        else{
            algo_id = '1';
        }
        let resultImageName = await run_cmfd_algo(algo_id, suspectedImage.tempFilePath);
        let reslutImagePath = path.join(script_output_path, resultImageName)
        await checkExistsWithTimeout(reslutImagePath, 500);
        let detection_result_image_public_path = path.join(detection_result_public_folder, resultImageName);
        res.render('cm-detect/detect', {
            title: 'Detect',
            detection_method: '1',
            detection_result_url: detection_result_image_public_path,
            session: req.session,
            show_detect_again: algo_id == '1',
            isAdminUser: req.session.user.username == config.adminUser.username
          });
    }
    catch(error){
        res.status(500).end('Server Error');
    }
    // TODO: delete temp files: suspectedImage, analyzedImagePath
});

router.get('/', function (req, res, next) {
    res.render('cm-detect/detect', {
        title: 'Detect',
        detection_method: '1',
        session: req.session,
        show_detect_again: true,
        isAdminUser: req.session.user.username == config.adminUser.username
      });
});

module.exports = router;

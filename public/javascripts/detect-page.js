var modifiy_page_form = function (new_algo_id) {
    document.getElementById('result_container').style.display = "none";
    document.getElementById('result_paragraph').style.display = "none";
    document.getElementById('detect_again_container').style.display = "none";
    document.getElementById('detection_method').value = new_algo_id;
    document.getElementById('upload_again_container').innerHTML = 'Upload the image again.';
    document.getElementById('upload_again_container').classList.add('alert', 'alert-primary');
}
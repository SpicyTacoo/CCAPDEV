function showFileName() {
    var fileName = document.getElementById("imageInput");
    var currentFileName = document.getElementById("img-file");
    
    currentFileName.innerHTML = fileName.files.item(0).name;
};
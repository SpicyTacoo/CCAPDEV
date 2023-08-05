function changeImage(event) {
    var chosenImage = document.getElementById("image-file");
    var currentImage = document.getElementById("current-pic");

    chosenImage.src = URL.createObjectURL(event.target.files[0]);
    currentImage.src = chosenImage.src;

    chosenImage.onload = function() {
        URL.revokeObjectURL(output.src) // free memory
    }
};

// wait till DOM is loaded to execute
window.addEventListener("DOMContentLoaded", (event) => {
    const textarea = document.getElementById("description-area");
    textarea.addEventListener("keyup", e =>{
        let scHeight = e.target.scrollHeight;
        if (scHeight > 45) {
            textarea.style.height = `${scHeight}px`;
        }
        console.log(scHeight);
    });
});

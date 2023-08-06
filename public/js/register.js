const firstNameInput = document.querySelector("#firstname");
const lastNameInput = document.querySelector("#lastname");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const imageInput = document.querySelector("#image-file"); 
const shortDescriptionInput = document.querySelector("#shortDescription");
const errorContainer =  document.querySelector("#error-container");
const submitButton = document.querySelector("#submit-button");
const registerContainer = document.querySelector("#container");
const laberForImage = document.querySelector('label[for="image-file"]');

function showFileName() {
    var fileName = document.getElementById("image-file");
    var currentFileName = document.getElementById("img-file");
    
    currentFileName.innerHTML = fileName.files.item(0).name;
};

usernameInput?.addEventListener("keyup", async function (e) {
    e.preventDefault();

    const usernameValue = usernameInput.value;
    const username = usernameValue.replace(/\s/g, "").toLowerCase();
    
    const response = await fetch ('/checkUsername?username='+ username, {
        method: 'GET',
    });

    if (response.status == 200) {
        usernameInput.style.borderColor = null;
        // usernameInput.style.color = null;
        errorContainer.innerHTML = "";
        errorContainer.style.border = "none"
        submitButton.disabled = false;
    } else {
        usernameInput.style.borderColor = "red";
        // usernameInput.style.color = "red";
        errorContainer.innerHTML = "Username already exist!";
        errorContainer.style = `border: 2px solid white`;
        submitButton.disabled = true;
    }
});

usernameInput.addEventListener("keypress", async function (e) {
    if (e.which === 32)
        e.preventDefault();
});

submitButton.addEventListener("click", function (e) {

    const firstName = firstNameInput.value;
    const lastName = lastNameInput.value;
    const username = usernameInput.value;
    const password = passwordInput.value;
    const image = imageInput.value;
    const shortDescription = shortDescriptionInput.value;

    if (firstName === '') {
        errorContainer.innerHTML = "Please input your first name!";
        errorContainer.style = `border: 2px solid white`;
        firstNameInput.style.borderColor = "red"
    }
    
    else if (lastName === '') {
        errorContainer.innerHTML = "Please input your last name!";
        errorContainer.style = `border: 2px solid white`;
        lastNameInput.style.borderColor = "red"
    }

    else if (username === '') {
        errorContainer.innerHTML = "Please input your username!";
        errorContainer.style = `border: 2px solid white`;
        usernameInput.style.borderColor = "red"
    }

    else if (password === '') {
        errorContainer.innerHTML = "Please input your password!";
        errorContainer.style = `border: 2px solid white`;
        passwordInput.style.borderColor = "red"
    }

    else if (image === '' || image === null) {
        errorContainer.innerHTML = "Please attach your profile picture!";
        errorContainer.style = `border: 2px solid white`;
        laberForImage.style.borderColor = "red"
    }

    else {
        errorContainer.innerHTML = "";
        errorContainer.style.border = "none"

        firstNameInput.value = firstNameInput.value.trim().toUpperCase();
        lastNameInput.value = lastNameInput.value.trim().toUpperCase();

        if (shortDescription === '' || shortDescription === null) {
            shortDescriptionInput.value = "nothing to see...";
        }
        else {
            shortDescriptionInput.value = shortDescriptionInput.value.trim();
        }
    }
});

$('#review-form').submit(function(){
    $('input[type=submit]', this).attr('disabled', 'disabled');
});

[firstNameInput, lastNameInput, usernameInput, passwordInput, imageInput].forEach(function(element) {
    element.addEventListener("click", function(e) {
        errorContainer.innerHTML = "";
        errorContainer.style.border = "none"
    });
});

firstNameInput.addEventListener("change", function (e) {
    firstNameInput.style.borderColor = null;
});

lastNameInput.addEventListener("change", function (e) {
    lastNameInput.style.borderColor = null;
});

passwordInput.addEventListener("change", function (e) {
    passwordInput.style.borderColor = null;
});

imageInput.addEventListener("change", function (e) {
    imageInput.style.borderColor = null;
});

document.addEventListener('invalid', (function () {
    return function (e) {
        e.preventDefault();
    };
})(), true);
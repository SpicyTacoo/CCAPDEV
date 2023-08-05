const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const errorContainer =  document.querySelector("#error-container-login");
const submitButton = document.querySelector("#submit-button");

submitButton?.addEventListener("click", function (e) {
    console.log("submit");

    const username = usernameInput.value;
    const password = passwordInput.value;

    if (username === '') {
        errorContainer.innerHTML = "Please input your username!";
        errorContainer.style = `border: 2px solid white`;
        usernameInput.style.borderColor = "red"
    }

    else if (password === '') {
        errorContainer.innerHTML = "Please input your password!";
        errorContainer.style = `border: 2px solid white`;
        passwordInput.style.borderColor = "red"
    }

    else {
        errorContainer.innerHTML = "";
        errorContainer.style.border = "none"
    }
});

[usernameInput, passwordInput].forEach(function(element) {
    element.addEventListener("click", function(e) {
        console.log("click")

        errorContainer.innerHTML = "";
        errorContainer.style.border = "none"
    });
});

usernameInput.addEventListener("change", function (e) {
    console.log("click");
    
    usernameInput.style.borderColor = null;
});

passwordInput.addEventListener("change", function (e) {
    console.log("click");
    
    passwordInput.style.borderColor = null;
});

document.addEventListener('invalid', (function () {
    return function (e) {
        e.preventDefault();
    };
})(), true);


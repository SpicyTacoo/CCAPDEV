const stars = document.querySelectorAll(".stars i");
const ratingValue = document.getElementById("review-rating-value");

stars.forEach((star, index1) => {
    star.addEventListener("click", () => {
        console.log('clicked');
        stars.forEach((star, index2) => {
            index1 >= index2 ? star.classList.add("active") : star.classList.remove("active");
        })
        ratingValue.textContent = (index1 + 1) + " out of 5";
    })
})
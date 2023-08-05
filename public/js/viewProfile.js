let post = document.getElementsByClassName("post-content-text");

for (let i = 0; i < post.length; i++) {
    let para = post[i];
    let paraContent = para.innerHTML;
    para.innerHTML = "";
    let words = paraContent.split(" ");

    if (words.length > 14) {
        for (let j = 0; j < 14; j++) {
            if (j == 13) {
                para.innerHTML += words[j];
                para.innerHTML += "..."
            }
            else {
                para.innerHTML += words[j] + " ";
            }
        }
    }

    else {
        for (let j = 0; j < words.length; j++) {
            para.innerHTML += words[j] + " ";
        }
    }
}

//select all <button> elements on my page
let buttons = document.querySelectorAll("button.price")
//select first HTML element with class of score
let budgetAmount = document.getElementById("budget1")
let artAmount = document.getElementById("nArt1")

let budget = 50000000;
let nArt = 0;




function check(event) {
    let button = event.target;
    let question = button.parentElement;

    const BidPrice = parseInt(event.target.value);

    if (button.classList.contains("correct")){
        button.style.background = "green";

        budget = budget + BidPrice;
       
        budgetAmount.textContent = budget;
    }
    else if(button.classList.contains("purchase")){
        button.style.background = "green";
        budget = budget + BidPrice;
        budgetAmount.textContent = budget;
        nArt = nArt + 1.0;
        artAmount.textContent = nArt;
    }
    else {
        button.style.background = "red";
    }
    
    let questionButtons = question.querySelectorAll("button"); 

    for (let button of questionButtons){
    button.disabled = true;
    }
}

//for each button on my list
for(let button of buttons){
    //run check function when its cliced
       button.onclick = check;
    }


const hints = [
    "The artwork is from the abstract expressionism period.",
    "This artist passed away soon after.",
    "Similar artworks have sold for over $3 million.",
    "Similar works featured in Guggenheim, MOMA, National Gallery of Art",
    "In 2015, Number 36 (1962) was sold for 1.5 million at Christie's London"
];

// Function to display a random hint
function displayRandomHint() {
    // Get a random index from the hints array
    const randomIndex = Math.floor(Math.random() * hints.length);

    // Display the random hint in the paragraph
    const hintDisplay = document.getElementById("hintDisplay");
    hintDisplay.textContent = hints[randomIndex];

    budget = budget - 10000;
    budgetAmount.textContent = budget;

}

// Add an event listener to the button to trigger the hint display
const hintButton = document.getElementById("hintButton");
hintButton.addEventListener("click", displayRandomHint);


const next = document.getElementById("next");
next.addEventListener('click',saveData);
function saveData(){
localStorage.setItem("budget", budget);
localStorage.setItem("nArt", nArt);
}








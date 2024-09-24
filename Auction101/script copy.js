//select all <button> elements on my page
let buttons = document.querySelectorAll("button.price")
//select first HTML element with class of score
let budgetAmount = document.getElementById("budget1")
let artAmount = document.getElementById("nArt1")

let budget = 1000000000;
let nArt = 0;




function check(event) {
    let button = event.target;
    let SBquestion = button.parentElement;

    const sBidPrice = parseInt(event.target.value);

    if (button.classList.contains("correct")){
        button.style.background = "green";

        //updating the score
        budget = budget + sBidPrice;
        //display score to user on page
        budgetAmount.textContent = budget;
    }
    else {
        button.style.background = "red";
    }

    

    //find all button elements inside current question
    let SBquestionButtons = SBquestion.querySelectorAll("button"); 

    //disable other buttons
    for (let button of SBquestionButtons){
    button.disabled = true;
    }
}

function check(event) {

    //find clicked button
    let button = event.target;

    //find current question
    let FBquestion = button.parentElement;

    //const startBid = question.querySelectorAll("button");
    const sBidPrice = parseInt(event.target.value);

    if (button.className.match("purchase")){
        button.style.background = "green";

        //updating the score
        budget += sBidPrice;
        //display score to user on page
        budgetAmount.textContent = budget;
        nArt += 1;
        artAmount.textContent = nArt;
    }
    else {
        button.style.background = "red";
    }

    

    //find all button elements inside current question
    let FBquestionButtons = FBquestion.querySelectorAll("button"); 

    //disable other buttons
    for (let button of FBquestionButtons){
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






/*function check(event) {

    //find clicked button
    let button = event.target;
    //Get class name of button
    let name = button.className;
    //find current question
    let clues = button.parentElement;

if (name == "hint"){
    button
    let explanation =  clues.querySelector(".explanation");
        explanation.style.display = "block";
} 
//find all button elements inside current question
let hintButtons = clues.querySelectorAll("button"); 

//disable other buttons
for (let button of hintButtons){
button.disabled = true;
}
}
*/






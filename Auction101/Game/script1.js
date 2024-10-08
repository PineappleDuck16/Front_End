
let buttons = document.querySelectorAll("button.price")


const budgetValue = localStorage.getItem("budget");
const artNum1 = localStorage.getItem("nArt");
document.getElementById("displayBudget").textContent = budgetValue
document.getElementById("displayartNum").textContent = artNum1   


let budget = Number(budgetValue);
let nArt = Number(artNum1);


function check(event) {
    let button = event.target;
    let question = button.parentElement;

    const BidPrice = parseInt(event.target.value);

    if (button.classList.contains("correct")){
        button.style.background = "green";

        budget = budget + BidPrice;
       
        displayBudget.textContent = budget;
    }
    else if(button.classList.contains("purchase")){
        button.style.background = "green";
        budget = budget + BidPrice;
        displayBudget.textContent = budget;
        nArt = nArt + 1.0;
        displayartNum.textContent = nArt;
    }
    else {
        button.style.background = "red";
    }
    
    let questionButtons = question.querySelectorAll("button"); 

    for (let button of questionButtons){
    button.disabled = true;
    }
}

for(let button of buttons){
  
       button.onclick = check;
    }

const hints = [
    "Monet's work represents a key moment in art history as part of the Impressionist movement.",
    "Paintings from Monet's haystack series are rare.",
    "Monet's haystack series is iconic, symbolizing the broader Impressionist movement in popular culture.",
    "The painting's well-preserved state enhances its desirability and value."
];

function displayRandomHint() {

    const randomIndex = Math.floor(Math.random() * hints.length);

    const hintDisplay = document.getElementById("hintDisplay");
    hintDisplay.textContent = hints[randomIndex];

    budget = budget - 10000;
    displayBudget.textContent = budget;

}


const hintButton = document.getElementById("hintButton");
hintButton.addEventListener("click", displayRandomHint);


const next = document.getElementById("next");
next.addEventListener('click',saveData);
function saveData(){
localStorage.setItem("budget", budget);
localStorage.setItem("nArt", nArt);
}






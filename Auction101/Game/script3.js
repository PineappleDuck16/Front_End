
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
    "In Natura Morta, Morandi's precise arrangement of simple bottles, vases, and jars creates a harmonious balance, showcasing his exceptional skill in composition",
    "Morandi's meticulous attention to the texture and surface of the objects in Natura Morta adds depth and complexity, enhancing the painting's value.",
    "Natura Morta was created during a period when Morandi was refining his minimalist style, making this painting a key example of his mature work.",
    "This specific painting has been recognized as a precursor to minimalism, influencing generations of artists, thus increasing its cultural and monetary worth",
    "the consistent demand for Morandi's Natura Morta series, which is considered the pinnacle of his oeuvre, drives up auction prices, making these paintings highly expensive."
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







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
/*function check(event) {

    let button = event.target;

    let SBquestion = button.parentElement;
    const ssBidPrice = parseInt(event.target.value);

    if (button.className.match("correct")){

        button.style.background = "green";

        budget = budget + ssBidPrice;
        
        displayBudget.textContent = budget;
    }
    else {
        button.style.background = "red";
    }


    let SBquestionButtons = SBquestion.querySelectorAll("button"); 

    for (let button of SBquestionButtons){
    button.disabled = true;
    }
}

function check(event) {

    let button = event.target;

    let FBquestion = button.parentElement;


    const sBidPrice = parseInt(event.target.value);

    if (button.classList.contains("purchase")){

        alert('aaaa')

        button.style.background = "green";

        console.log(budget)
        console.log(sBidPrice)
        budget = budget +sBidPrice;
    
        nArt += 1;
    displayBudget.textContent = budget;
    displayartNum.textContent = nArt;
    }
    else {
        button.style.background = "red";
    }
    

   
    let FBquestionButtons = FBquestion.querySelectorAll("button"); 

   
    for (let button of FBquestionButtons){
    button.disabled = true;
    }
}


for(let button of buttons){
       button.onclick = check;
    }
*/

const hints = [
    "The artwork is from the abstract expressionism period.",
    "This artist passed away soon after.",
    "Similar artworks have sold for over $3 million.",
    "Similar works featured in Guggenheim, MOMA, National Gallery of Art",
    "In 2015, Number 36 (1962) was sold for 1.5 million at Christie's London"
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






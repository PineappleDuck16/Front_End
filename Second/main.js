
// const cube = document.querySelector(".cube");
// let mouseX = 0;
// let mouseY = 0;
// const rotationValue = 100

// window.onload = function() {
//     document.querySelector('.container').style.display = 'none';
// };

// const handleMouseMove = (event) => {
//     mouseX = event.clientX;
//     mouseY = event.clientY;
//     rotateX= -(mouseY / window.innerHeight - 0.5) * rotationValue;
//     rotateY= (mouseX/window.innerWidth -0.5) * rotationValue;
//     cube.style.transform= `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
// }

// window.addEventListener("mousemove",handleMouseMove);


// const change = document.querySelector(".page1");
// const trigger = document.getElementById("button");

// trigger.addEventListener("click", ()=> {
//     change.style.clipPath = "circle(0% at 50% 50%)";
//     setTimeout(greet, 3000);    
    
// });
// function greet() {
// document.querySelector('.container').style.display = 'block';
// }


// const jump = document.querySelectorAll('.loader span');
// let mouseMoving = false;

// // Function to start animation when the mouse moves
// function onMouseMove() {
//   mouseMoving = true;
//   jump.forEach(span =>{span.style.animationPlayState = 'running';}); // Start the animation

//   // Stop the animation if no movement occurs after a delay
//   clearTimeout(stopAnimationTimeout);
//   stopAnimationTimeout = setTimeout(() => {
//     jump.forEach(span =>{span.style.animationPlayState = 'paused';});// Pause the animation
//     mouseMoving = false;
//   }, 500); // Adjust the time (in milliseconds) to determine how quickly it should pause after movement stops
// }

// // Attach the mousemove event listener to the document
// document.addEventListener('mousemove', onMouseMove);

// // Timeout variable to manage stopping animation
// let stopAnimationTimeout;
   
var Engine = Matter.Engine,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;
var engine;
var sphere = [];
var world;
// var ground;

function setup(){
     createCanvas(400, 400);
     engine = Engine.create();
     world = engine.world 
     Engine.run(engine);
//     var options = {
//         isStatic: true
//     }
//    ground = Bodies.rectangle(200,height,width,10,options);
//    world.add(world,ground);
}
function mousePress(){
    sphere.push(new createSphere(mouseX,mouseY,50,50));
}

function draw(){
     background('#fae')
    for (var i = 0; i<sphere.length; i ++){
        sphere[i].show()  
    }
}

function createSphere(x,y,radius){
//       var options = {
//           restitution: 0.6
//       }
this.body = Bodies.circle(x,y,radius);
this.w = w;
this.h = h;
World.add(wold, this.body);
      
      this.show = function(){
          var pos = this.body.position;
          var angle = this.body.angle; 
          push();
          rotate(angle);
          rectMode(CENTER);
          translate(pos.x, pos.y);
          rect(0,0,this.w,this.h);
          pop();
      }
}
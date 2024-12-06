function createSphere(x,y,radius){
    var options = {
        restitution: 0.6
    }
    this.body = Bodies.rectangle(x,y,radius);
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
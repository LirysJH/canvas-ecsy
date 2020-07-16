import { World, System, Component, TagComponent, Types } from 'https://ecsy.io/build/ecsy.module.js';

const NUM_ELEMENTS = 40;
const SPEED_MULTIPLIER = 0.1;
const SHAPE_SIZE = 20;
const SHAPE_HALF_SIZE = SHAPE_SIZE / 2;
const SHAPE_RANDOM_SIZE = SHAPE_HALF_SIZE - SHAPE_HALF_SIZE * Math.random();
const RANDOM_TIME = 4;

let mousePos = {
    x: 0,
    y: 0
}

// get mouse coordinates
document.onmousemove = (e) => {
    mousePos = {
        x: e.pageX,
        y: e.pageY
    }
}
      
// Initialize canvas
let canvas = document.querySelector("canvas");
let canvasWidth = canvas.width = window.innerWidth;
let canvasHeight = canvas.height = window.innerHeight;
let ctx = canvas.getContext("2d");

window.addEventListener( 'resize', () => {
    canvasWidth = canvas.width = window.innerWidth
    canvasHeight = canvas.height = window.innerHeight;
}, false );

//----------------------
// Components
//----------------------

// Velocity component
class Velocity extends Component {}

Velocity.schema = {
    x: { type: Types.Number },
    y: { type: Types.Number }
};

// Position component
class Position extends Component {}

Position.schema = {
    x: { type: Types.Number },
    y: { type: Types.Number }
};

// Shape component
 class Shape extends Component {}

Shape.schema = {
    primitive: { type: Types.String, default: 'box' }
};


// Renderable component
class Renderable extends TagComponent {}

//----------------------
// Systems
//----------------------

// MovableSystem
class MovableSystem extends System {
    // This method will get called on every frame by default
    execute(delta, time) {
        // Iterate through all the entities on the query
        this.queries.moving.results.forEach(entity => {
            let velocity = entity.getComponent(Velocity);
            let position = entity.getMutableComponent(Position);
            position.x += velocity.x * delta;
            position.y += velocity.y * delta;

            if (position.x > canvasWidth + SHAPE_HALF_SIZE) position.x = - SHAPE_HALF_SIZE;
            if (position.x < - SHAPE_HALF_SIZE) position.x = canvasWidth + SHAPE_HALF_SIZE;
            if (position.y > canvasHeight + SHAPE_HALF_SIZE) position.y = - SHAPE_HALF_SIZE;
            if (position.y < - SHAPE_HALF_SIZE) position.y = canvasHeight + SHAPE_HALF_SIZE;
        });
    }
}

// Define a query of entities that have "Velocity" and "Position" components
MovableSystem.queries = {
    moving: {
        components: [Velocity, Position]
    }
}

// RendererSystem
class RendererSystem extends System {
    // This method will get called on every frame by default
    execute(delta, time) {

        ctx.globalAlpha = 1;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        //ctx.globalAlpha = 0.6;

        // Iterate through all the entities on the query
        this.queries.renderables.results.forEach(entity => {
            let shape = entity.getComponent(Shape);
            let position = entity.getComponent(Position);
            if (shape.primitive === 'box') {
              this.drawBox(position);
            } else {
              this.drawCircle(position);
            }
          });
        }

        getRandom = (val) => Math.random() * val;
        
        drawCircle = (position) => {
            ctx.fillStyle = "#888";
            ctx.beginPath();
            ctx.arc(position.x,
                    position.y,
                    SHAPE_RANDOM_SIZE,
                    0,
                    2 * Math.PI,
                    false);
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#222";
            ctx.stroke();    
        }
        
        drawBox = (position) => {
            ctx.beginPath();
            ctx.rect(position.x - SHAPE_RANDOM_SIZE,
                    position.y - SHAPE_RANDOM_SIZE,
                    SHAPE_RANDOM_SIZE,
                    SHAPE_RANDOM_SIZE);
            ctx.fillStyle= "#f28d89";
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#800904";
            ctx.stroke();  
        }
    }

    // Define a query of entities that have "Renderable" and "Shape" components
    RendererSystem.queries = {
        renderables: { components: [Renderable, Shape] }
    }
      
    // Create world and register the systems on it
    let world = new World();
    world
        .registerSystem(MovableSystem)
        .registerSystem(RendererSystem)
        .registerComponent(Renderable)
        .registerComponent(Shape)
        .registerComponent(Velocity)
        .registerComponent(Position);

    // Some helper functions when creating the components
    let getRandomVelocity = () => {
        return {
          x: SPEED_MULTIPLIER * (2 * Math.random() - 1), 
          y: SPEED_MULTIPLIER * (2 * Math.random() - 1)
        };
    }
      
    let getDrawPosition = () => {
        return { 
          x: mousePos.x, // Math.random() * canvasWidth
          y: mousePos.y  // Math.random() * canvasHeight
        };
    }
      
    let getRandomShape = () => {
        return {
           primitive: Math.random() >= 0.5 ? 'circle' : 'box'
        };
    }
    canvas.addEventListener("click", () => {

        for (let i = 0; i < NUM_ELEMENTS; i++) {
            let entity = world.createEntity();

            entity
            .addComponent(Velocity, getRandomVelocity())
            .addComponent(Shape, getRandomShape())
            .addComponent(Position, getDrawPosition())
            .addComponent(Renderable);
            
            // time to disappear
            setTimeout(
                () => entity.removeComponent(Renderable),
                (RANDOM_TIME - RANDOM_TIME * Math.random()) * 1000);
        }

    }, false);
            
// Run!
let run = () => {
    // Compute delta and elapsed time
    let time = performance.now();
    let delta = time - lastTime;

    // Run all the systems
    world.execute(delta, time);    

    lastTime = time;
    requestAnimationFrame(run);
}

let lastTime = performance.now();
run();

/*global THREE, requestAnimationFrame, console*/
var scene, camera, cameraFrontal, cameraTop, cameraLateral, cameraMoving, renderer, cil1, cil2;
var stop = false;
const red = 0xff0000;
const green = 0x00ff00;
const blue = 0x0000ff;
const purple = 0x800080;
const white = 0xffffff;
const pink = 0xff006f;
const cyan = 0x00ffef;
const yellow = 0xffff00;
const orange = 0xff6f00;
const grey = 0xc0c0c0;
const lightspeed = 0xa8e6ff;

var keys_pressed = {};
var last_state_space = false;
var last_state_4 = false;
var last_state_5 = false;
const planet_size = 100;

var programStartTime = new Date().getTime();

const maxAngleCos = 0.0871557;

var time;
var delta;

// x = -; y = +; z = +
// x = +; y = +; z = +
// x = -; y = -; z = +
// x = +; y = -; z = +
// x = -; y = +; z = -
// x = +; y = +; z = -
// x = -; y = -; z = -
// x = +; y = -; z = -

var holy_trash = [];
var trash_Array = [];
var trash_Array0 = [];
var trash_Array1 = [];
var trash_Array2 = [];
var trash_Array3 = [];
var trash_Array4 = [];
var trash_Array5 = [];
var trash_Array6 = [];
var trash_Array7 = [];
holy_trash.push(trash_Array0);
holy_trash.push(trash_Array1);
holy_trash.push(trash_Array2);
holy_trash.push(trash_Array3);
holy_trash.push(trash_Array4);
holy_trash.push(trash_Array5);
holy_trash.push(trash_Array6);
holy_trash.push(trash_Array7);

var trash_number = 20;

var teta1;
var teta2;

var speed = Math.PI/240*75;

var MOV_CONTROL_BTN_LEFT, MOV_CONTROL_BTN_RIGHT, MOV_CONTROL_BTN_UP, MOV_CONTROL_BTN_DOWN = false;


class CustomCurve extends THREE.Curve {

	constructor( scale = 1 ) {

		super();

		this.scale = scale;

	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {

		const tx = 0;
		const ty = t * 0.2 - 1.5;
		const tz = 0;

		return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );

	}

}

function createBall(obj, x, y, z, c, b1, b2, b3, name, nei) {

    'use strict';
    
    obj = new THREE.Object3D();
    obj.userData = { jumping: true, step: 0 };
    
    var material = new THREE.MeshBasicMaterial({ color: c, wireframe: true });
    var geometry = new THREE.SphereGeometry(b1, b2, b3);
    var mesh = new THREE.Mesh(geometry, material);
    
    obj.add(mesh);
    obj.position.set(x, y, z);
    obj.name = name;
    nei.add(obj);
    return obj;
}

function createHalfSphere(obj, x, y, z, c, radius, widthSeg, heightSeg, phiStart, phiLength, name, nei, rotation) {
    'use strict';

    obj = new THREE.Object3D();
    
    var material = new THREE.MeshBasicMaterial({color : c, wireframe: true, opacity: 0.5, transparent: true});
    var geometry = new THREE.SphereGeometry(radius, widthSeg, heightSeg, phiStart, phiLength, 0, 0.5);
    var mesh = new THREE.Mesh(geometry, material);

    obj.add(mesh);
    obj.position.set(x, y, z);
    obj.name = name;
    obj.rotation.z = rotation;
    obj.rotation.x = (3*Math.PI)/2;
    nei.add(obj);
}

function createCone(obj, x, y, z, c, radius, height, radialSegments, heightSegments, rotation, nei) {

    'use strict';
    obj = new THREE.Object3D();
    var geometry = new THREE.ConeGeometry(radius, height, radialSegments, heightSegments);
    //obj.userData = { jumping: true, step: 0 };
    
    var material = new THREE.MeshBasicMaterial({ color: c, wireframe: true });
    var mesh = new THREE.Mesh(geometry, material);

    obj.position.set(x, y, z);
    obj.add(mesh);
    obj.rotation.x = rotation;
    //mesh sentido??
    nei.add(obj);
}

function createCylinder(obj, x, y, z, c, sizeBASE, sizeTOP, length, desenty, name, nei) {

    'use strict';
    obj = new THREE.Object3D();
    var geometry = new THREE.CylinderGeometry( sizeBASE, sizeTOP, length, desenty);
    obj.userData = { mov: true, step: 0 };
    
    var material = new THREE.MeshBasicMaterial({ color: c, wireframe: true});
    material.side = THREE.DoubleSide;
    var mesh = new THREE.Mesh(geometry, material);
    
    
    obj.add(mesh);
    obj.position.set(x, y, z);
    obj.name = name;
    nei.add(obj);
    return obj;
}

function createDonnut(obj, x, y, z, c, radius, tube, radialSegments, tubularSegments, vector, name, nei) {

    'use strict';
    obj = new THREE.Object3D();
    var geometry = new THREE.TorusGeometry( radius, tube, radialSegments, tubularSegments);
    //obj.userData = { jumping: true, step: 0 };
    
    var material = new THREE.MeshBasicMaterial({ color: c, wireframe: true });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.lookAt(vector);
    obj.add(mesh);
    obj.position.set(x, y, z);
    obj.name = name;
    //mesh sentido
    nei.add(obj);
}

function createBox(obj, x, y, z, c, width, height, depth, name, nei, rotation) {

    'use strict';
    obj = new THREE.Object3D();
    var geometry = new THREE.BoxGeometry(width, height, depth);
    //obj.userData = { jumping: true, step: 0 };
    
    var material = new THREE.MeshBasicMaterial({ color: c, wireframe: true });
    var mesh = new THREE.Mesh(geometry, material);
    obj.add(mesh);
    obj.rotation.y += rotation;
    obj.position.set(x, y, z);
    obj.name = name;
    //mesh sentido??
    nei.add(obj);
    return obj;
}

function createTube(obj, x, y, z, c, path, segments, radius, radialSegments, nei) {

    'use strict';
    obj = new THREE.Object3D();
    var geometry = new THREE.TubeGeometry(path, segments, radius, radialSegments, false);
    //obj.userData = { jumping: true, step: 0 };
    
    var material = new THREE.MeshBasicMaterial({ color: c, wireframe: true, side: THREE.DoubleSide });
    var mesh = new THREE.Mesh(geometry, material);
    
    obj.add(mesh);
    obj.position.set(x, y, z);
    //mesh sentido??
    nei.add(obj);
}

function createIcosahedron(obj, x, y, z, c, radius, vector, name, nei){

    obj = new THREE.Object3D();
    obj.userData = {step: 0, mov:true};
    var geometry = new THREE.IcosahedronGeometry(radius);
    var material = new THREE.MeshBasicMaterial({ color: c, wireframe: true });
    var mesh = new THREE.Mesh(geometry, material);

    mesh.lookAt(vector);
    obj.add(mesh);
    obj.position.set(x, y, z);
    obj.name = name;
    nei.add(obj);
}


function createCapsule(obj, x, y, z, c, radius, length, capSegments, heightSegments, name, nei){
    'use strict';
    obj = new THREE.Object3D();
    const geometry = new THREE.CapsuleGeometry( radius, length, capSegments, heightSegments);
    const material = new THREE.MeshBasicMaterial( {color: c} );
    const capsule = new THREE.Mesh( geometry, material );
    obj.add(capsule);
    obj.position.set(x, y, z);
    obj.name = name;
    nei.add(obj);
}

function createRocket(obj, x, y, z, name, nei){
    obj = new THREE.Object3D();
    obj.userData = {step: 0, mov:true};
    var body, top, c1, c2, c3, c4, p1, p2, p3, p4;
    createCylinder(body, x, y, z, white, planet_size*0.0096, planet_size*0.0096, planet_size*0.081, 20, "body", obj);
    createCylinder(top, x, y + (planet_size*0.081)/2 + (planet_size*0.01)/2, z, white, planet_size*0.0014, planet_size*0.0096, planet_size*0.01, 20, "top", obj);
    //createCylinder(top, 0, 0.5, 0, red, 0.10, 10, 20, 20, "top", obj);

    //createCylinder(body, x, y, z, white, 1, 1, 4, 20, "body", obj);
    //createCylinder(top, x, y+3, z, red, 0.1, 1, 1, 20, "top", obj);
    createCapsule(c1, x + (planet_size*0.0096), y- (planet_size*0.081)/2 + (planet_size*0.046)/2, z, red, (planet_size*0.0073)/2, planet_size*0.046, 20, 20, "c1", obj);
    createCapsule(c2, x - (planet_size*0.0096), y- (planet_size*0.081)/2 + (planet_size*0.046)/2, z, red, (planet_size*0.0073)/2, planet_size*0.046, 20, 20, "c2", obj);
    createCapsule(c3, x, y- (planet_size*0.081)/2 + (planet_size*0.046)/2, z + (planet_size*0.0096), red, (planet_size*0.0073)/2, planet_size*0.046, 20, 20, "c3", obj);
    createCapsule(c4, x, y- (planet_size*0.081)/2 + (planet_size*0.046)/2, z - (planet_size*0.0096), red, (planet_size*0.0073)/2, planet_size*0.046, 20, 20, "c4", obj);
    
    createCylinder(p1, x + (planet_size*0.0096), y- (planet_size*0.081)/2 + (planet_size*0.0096)/2, z, red, (planet_size*0.0073)/2, (planet_size*0.0073)/2 + 0.5, (planet_size*0.0096), 20, "p1", obj);
    createCylinder(p2, x - (planet_size*0.0096), y -(planet_size*0.081)/2 + (planet_size*0.0096)/2, z, red, (planet_size*0.0073)/2, (planet_size*0.0073)/2 + 0.5, (planet_size*0.0096), 20, "p2", obj);
    createCylinder(p3, x, y- (planet_size*0.081)/2 + (planet_size*0.0096)/2, z  + (planet_size*0.0096), red, (planet_size*0.0073)/2, (planet_size*0.0073)/2 + 0.5, (planet_size*0.0096), 20, "p3", obj);
    createCylinder(p4, x, y- (planet_size*0.081)/2 + (planet_size*0.0096)/2, z - (planet_size*0.0096), red, (planet_size*0.0073)/2, (planet_size*0.0073)/2 + 0.5, (planet_size*0.0096), 20, "p4", obj);

    obj.position.set(x, y, z);
    obj.name = name;
    //obj.lookAt(nei.position);
    obj.rotation.z = - Math.PI/2;
    obj.rotation.y = (Math.PI/2);
    nei.add(obj);
    

    let obj2 = new THREE.Object3D();
    let geometry2 = new THREE.SphereGeometry( planet_size*0.002);
    let material2 = new THREE.MeshBasicMaterial({color:white});
    material2.transparent = true;
    let mesh2 =  new THREE.Mesh(geometry2, material2);
    obj2.add(mesh2);
    obj2.position.set(x, y, z);
    obj2.name = "hitBox";
    obj.add(obj2);
    return obj;
}

function createPlanet(obj, x, y, z, name, nei){
    obj = new THREE.Object3D();
    var geometry = new THREE.SphereGeometry(planet_size, planet_size, planet_size);
    const texture1 =  new THREE.TextureLoader().load('https://upload.wikimedia.org/wikipedia/commons/a/ac/Earthmap1000x500.jpg');
    const texture2 = new THREE.TextureLoader().load('http://gis.humboldt.edu/Projects/2016_GSP470/EelRiver/OLD_CM_v_12/3D/images/earthbump1k.jpg');
    const texture3 = new THREE.TextureLoader().load('http://gis.humboldt.edu/Projects/2016_GSP470/EelRiver/OLD_CM_v_12/3D/images/earthspec1k.jpg');
    const material = new THREE.MeshPhongMaterial({color: white, map: texture1,
        bumpMap:texture2,
        bumpScale:5,
        specularMap:texture3,
        specular: lightspeed});
    //material.bumpMap = texture2;

    var earthmesh = new THREE.Mesh(geometry, material);

    obj.add(earthmesh);
    obj.position.set(x, y, z);
    obj.name = name;
    nei.add(obj);
    return obj;
}

function createStars(){

    for(var i = 0; i < 100; i++){
        var geometry = new THREE.SphereGeometry(3,30,30);
        var material = new THREE.MeshBasicMaterial({color:white});    
        var mesh  = new THREE.Mesh(geometry, material);
        var newX = Math.floor(Math.random() * 1000) - Math.floor(Math.random()*1000);
        var newY = Math.floor(Math.random() * 1000) - Math.floor(Math.random()*1000);
        var newZ = Math.floor(Math.random() * 1000) - Math.floor(Math.random()*1000);
        mesh.position.x = newX;
        mesh.position.y = newY;
        mesh.position.z = newZ;
        scene.add(mesh);
    };
}

function createLines(){
    for(var i = 0; i < 100; i++){
        var geometry = new THREE.CylinderGeometry(0.3,0.3,10, 20);
        var material = new THREE.MeshBasicMaterial({color:lightspeed});    
        var mesh  = new THREE.Mesh(geometry, material);
        var newX = Math.floor(Math.random() * 1000) - Math.floor(Math.random()*1000);
        var newY = Math.floor(Math.random() * 1000) - Math.floor(Math.random()*1000);
        var newZ = Math.floor(Math.random() * 1000) - Math.floor(Math.random()*1000);
        mesh.position.x = newX;
        mesh.position.y = newY;
        mesh.position.z = newZ;
        Math.floor(Math.random() * 6) + 1
        var angX = Math.floor(Math.floor(Math.random() * Math.PI/2) + 1);
        mesh.rotation.x = angX;
        scene.add(mesh);
    };
}

function addToOct(x, y, z, obj){
    // x = -; y = +; z = +
    // x = +; y = +; z = +
    // x = -; y = -; z = +
    // x = +; y = -; z = +
    // x = -; y = +; z = -
    // x = +; y = +; z = -
    // x = -; y = -; z = -
    // x = +; y = -; z = -
    if(x<0 && y>=0 && z>=0){
        trash_Array0.push(obj);
    }
    if(x>=0 && y>=0 && z>=0){
        trash_Array1.push(obj);
    }
    if(x<0 && y<0 && z>=0){
        trash_Array2.push(obj);
    }
    if(x>=0 && y<0 && z>=0){
        trash_Array3.push(obj);
    }
    if(x<0 && y>=0 && z<0){
        trash_Array4.push(obj);
    }
    if(x>=0 && y>=0 && z<0){
        trash_Array5.push(obj);
    }
    if(x<0 && y<0 && z<0){
        trash_Array6.push(obj);
    }
    if(x>=0 && y<0 && z<0){
        trash_Array7.push(obj);
    }
}

function chooseYourOct(x, y, z){

    if(x<0 && y>=0 && z>=0){
        return 0;
    }
    if(x>=0 && y>=0 && z>=0){
        return 1;
    }
    if(x<0 && y<0 && z>=0){
        return 2;
    }
    if(x>=0 && y<0 && z>=0){
        return 3;
    }
    if(x<0 && y>=0 && z<0){
        return 4;
    }
    if(x>=0 && y>=0 && z<0){
        return 5;
    }
    if(x<0 && y<0 && z<0){
        return 6;
    }
    if(x>=0 && y<0 && z<0){
        return 7;
    }
}

function createTrash(nei){
    for(var i = 0; i < trash_number; i++){
        var obj = new THREE.Object3D();
        var randomSize = Math.random() * (planet_size/24 - planet_size/20 + 1)+ planet_size/20;
        var geometry, material;
        if(Math.random() < 0.5){
            geometry = new THREE.BoxGeometry(randomSize, randomSize, randomSize);
            material = new THREE.MeshBasicMaterial({color:green});  
        }
        else{
            geometry = new THREE.IcosahedronGeometry(randomSize);
            material = new THREE.MeshBasicMaterial({color:green});  
        } 
        var mesh  = new THREE.Mesh(geometry, material);
        var vector = getPositions(planet_size);
        obj.add(mesh);
        obj.position.set(vector.x, vector.y, vector.z);
        nei.add(obj);
        trash_Array.push(obj);

        let obj2 = new THREE.Object3D();
        let geometry2 = new THREE.SphereGeometry(randomSize + 2);
        let material2 = new THREE.MeshBasicMaterial({color:white});
        material2.transparent = true;
        let mesh2 =  new THREE.Mesh(geometry2, material2);
        obj2.add(mesh2);
        obj2.position.set(vector.x, vector.y, vector.z);
        obj2.name = "hitBox";
        obj.add(obj2);
        addToOct(vector.x, vector.y, vector.z, obj);
    };
}

function getPositions(r){
    let max1 = (r*1.2)**2;
    let randomX = Math.random()*max1;
    let max2 = max1 - randomX;
    let randomY = Math.random()*max2;
    let randomZ = max2 - randomY;
    let randomX_sqrt = Math.sqrt(randomX);
    let randomY_sqrt = Math.sqrt(randomY);
    let randomZ_sqrt = Math.sqrt(randomZ);

    if(Math.random() < 0.5){
        randomX_sqrt = -randomX_sqrt;
    }
    if(Math.random() < 0.5){
        randomY_sqrt = -randomY_sqrt;
    }
    if(Math.random() < 0.5){
        randomZ_sqrt = -randomZ_sqrt;
    }

    return new THREE.Vector3(randomX_sqrt, randomY_sqrt, randomZ_sqrt);
}

function createMoon(x,y,z){

    auxMoon = new THREE.Object3D();
    auxMoon.name = "auxMoon";
    auxMoon.position.set(x,y,z);
    scene.add(auxMoon);

    obj = new THREE.Object3D();
    let geometry = new THREE.BoxGeometry(planet_size/5, planet_size/5, planet_size/5);
    const texture1 =  new THREE.TextureLoader().load('https://upload.wikimedia.org/wikipedia/pt/thumb/7/73/Trollface.png/330px-Trollface.png');
    const material = new THREE.MeshBasicMaterial( { color: yellow, map: texture1 } );
    let mesh =  new THREE.Mesh(geometry, material);
    obj.add(mesh);
    obj.name = "moon";
    auxMoon.add(obj);
    obj.position.set(planet_size*3, 0, 0);
}

function createCameraFrontal() {

    'use strict';
    cameraFrontal = new THREE.OrthographicCamera(
                                        window.innerWidth/ -2, window.innerWidth/ 2, 
                                        window.innerHeight / 2, window.innerHeight / -2,
                                        0, 500);
    cameraFrontal.position.x = 150;
    cameraFrontal.position.y = 0;
    cameraFrontal.position.z = 0;
    cameraFrontal.lookAt(scene.position);
}

function createCameraTop() {

    'use strict';
    cameraTop = new THREE.PerspectiveCamera(70,
                                         window.innerWidth / window.innerHeight,
                                         1,
                                         1000);
    cameraTop.position.x = 0;
    cameraTop.position.y = 250;
    cameraTop.position.z = 0;
    cameraTop.lookAt(scene.position);
}

function createCameraLateral() {

    'use strict';
    cameraLateral = new THREE.PerspectiveCamera(70,
                                         window.innerWidth / window.innerHeight,
                                         1,
                                         1000);
    cameraLateral.position.x = 150;
    cameraLateral.position.y = 0;
    cameraLateral.position.z = 0;
    cameraLateral.lookAt(scene.position);
}

function createMovingCamera(nei) {

    'use strict';
    cameraMoving = new THREE.PerspectiveCamera(50,
                                         window.innerWidth / window.innerHeight,
                                         1,
                                         1000);
    cameraMoving.position.x = nei.position.x;
    cameraMoving.position.y = nei.position.y -10;
    cameraMoving.position.z = nei.position.z + 20;
    cameraMoving.rotation.x += Math.PI/4;
    nei.add(cameraMoving);
}


function createLights(){
    var light = new THREE.AmbientLight( white, 0.3 );
    light.position.set( 150, 0, 150 );
    light.lookAt((0,0,0));
    scene.add(light);

    var sun = new THREE.PointLight(white, 0.5);
    sun.position.set(150, 0, 150);
    scene.add(sun);
}

function createScene() {

    'use strict';
    
    scene = new THREE.Scene();
    scene.add(new THREE.AxisHelper(50));

    var planet, rocket, auxToRocket;

    createStars();
    createLines();
    createTrash(scene);

    planet = createPlanet(planet, 0, 0, 0, "planet", scene);
    createMoon(0,0,0);

    auxToRocket = new THREE.Object3D();
    auxToRocket.name = "auxToRocket";
    auxToRocket.position.set(0,0,0);
    scene.add(auxToRocket);

    //Random position
    rocket = createRocket(rocket, 50, 50, 70, "rocket", auxToRocket);
    let control = true;
    while(control){
        teta1 = Math.random()*2*Math.PI;
        if(Math.cos(teta1) > maxAngleCos){
            break;
        }
    }
    teta2 = Math.random()*2*Math.PI;
    auxToRocket.rotation.z += teta1;
    auxToRocket.rotation.y += teta2;


    //let vec = generateRandomRocketPosition();
    //var rocket = createRocket(rocket, vec.x, vec.y, vec.z, "rocket", auxToRocket);

    createMovingCamera(rocket);
    createLights();
}

function onKeyDown() {

    'use strict';

    if(keys_pressed["1"] === true){
        camera = cameraFrontal;
    }
    if(keys_pressed["2"] === true){
        camera = cameraTop;
    }
    if(keys_pressed["3"] === true){
        camera = cameraMoving;
    }
    if(keys_pressed["arrowleft"] === true){
        MOV_CONTROL_BTN_LEFT = true;
    }
    if(keys_pressed["arrowright"] === true){
        MOV_CONTROL_BTN_RIGHT = true;  
    }
    if(keys_pressed["arrowup"] === true){
        MOV_CONTROL_BTN_UP = true;
    }
    if(keys_pressed["arrowdown"] === true){
        MOV_CONTROL_BTN_DOWN = true;
    }
    
}
function placeKeyInList(e){
    keys_pressed[e.key.toLowerCase()] = e.type === "keydown";
}

function render() {

    'use strict';
    renderer.render(scene, camera);
}

function onResize() {

    'use strict';

    renderer.setSize(window.innerWidth, window.innerHeight);
    
    if (window.innerHeight > 0 && window.innerWidth > 0) {
        
        cameraFrontal.left = window.innerWidth/ -2;
        cameraFrontal.right = window.innerWidth/ 2;
        cameraFrontal.top = window.innerHeight / 2;
        cameraFrontal.bottom = window.innerHeight / -2;
        cameraFrontal.near = 0;
        cameraFrontal.far = 500;
        cameraFrontal.updateProjectionMatrix();
        cameraMoving.aspect = window.innerWidth / window.innerHeight;
        cameraMoving.updateProjectionMatrix();
        cameraTop.aspect = window.innerWidth / window.innerHeight;
        cameraTop.updateProjectionMatrix();
    }

}

function init() {

    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    createCameraFrontal();
    createCameraLateral();
    createCameraTop();
    camera = cameraFrontal;
    
    window.addEventListener("keydown", placeKeyInList);
    window.addEventListener("keyup", placeKeyInList);   
    window.addEventListener("resize", onResize);

    time = new THREE.Clock(true);
}

function collision(){
    let aux_rocket = scene.getObjectByName("auxToRocket");
    let rocket = aux_rocket.getObjectByName("rocket");
    let hitBox = rocket.getObjectByName("hitBox");
    let rocket_pos = new THREE.Vector3();
    hitBox.getWorldPosition(rocket_pos);
    let choice = chooseYourOct(rocket_pos.x, rocket_pos.y, rocket_pos.z);
    let trash_Array_local;
    switch(choice){
        case 0:
            trash_Array_local = trash_Array0;
            break;
        case 1:
            trash_Array_local = trash_Array1;
            break;
        case 2:
            trash_Array_local = trash_Array2;
            break;
        case 3:
            trash_Array_local = trash_Array3;
            break;
        case 4:
            trash_Array_local = trash_Array4;
            break;
        case 5:
            trash_Array_local = trash_Array5;
            break;
        case 6:
            trash_Array_local = trash_Array6;
            break;
        case 7:
            trash_Array_local = trash_Array7;
            break;
    }
    var new_Array = [];
    for(let i = 0; i < trash_Array_local.length; i ++){
        let trash = trash_Array_local[i];
        //Get radius from trash sphere and rocket sphere
        let rad_from_trash = trash.children[1].children[0].geometry.parameters.radius;
        let rad_from_rocket = hitBox.children[0].geometry.parameters.radius;

        let min_dist = rad_from_rocket + rad_from_trash;
        let trash_pos = new THREE.Vector3();
        trash.getWorldPosition(trash_pos);

        let dist = Math.sqrt((trash_pos.x - rocket_pos.x)**2 + (trash_pos.y - rocket_pos.y)**2 +(trash_pos.z - rocket_pos.z)**2);

        if(dist <= min_dist){
            scene.remove(trash);
        }
        else{
            //If no hit, keep trash in array
            new_Array.push(trash);
        }
    }

    //Does who have been hit, delete from respective array
    if(choice == 0){
        trash_Array0 = new_Array;
    }
    else if(choice == 1){
        trash_Array1 = new_Array;
    }
    else if(choice == 2){
        trash_Array2 = new_Array;
    }
    else if(choice == 3){
        trash_Array3 = new_Array;
    }
    else if(choice == 4){
        trash_Array4 = new_Array;
    }
    else if(choice == 5){
        trash_Array5 = new_Array;
    }
    else if(choice == 6){
        trash_Array6 = new_Array;
    }
    else if(choice == 7){
        trash_Array7 = new_Array;
    }

}

function calculateAngleEarth(t){
    return (Math.PI*t)/50000;
}
function calculateAngleMoon(t){
    return (Math.PI*t)/50000;
}

function update(){

    //Update
    onKeyDown();

    if(!camera === cameraMoving){
        camera.lookAt(scene.position);
    }

    let now = new Date().getTime();
    now -= programStartTime;
    
    delta = time.getDelta();

    let planet = scene.getObjectByName("planet");
    planet.rotation.y = calculateAngleEarth(now);
    let auxMoon = scene.getObjectByName("auxMoon");
    auxMoon.rotation.y = calculateAngleMoon(now);
    let moon = auxMoon.getObjectByName("moon");
    moon.rotation.y = calculateAngleMoon(now);
    moon.rotation.x = calculateAngleMoon(now);
        
    let aux_rocket = scene.getObjectByName("auxToRocket");
    let rocket = aux_rocket.getObjectByName("rocket");

    let lastRocketPosition = new THREE.Vector3();
    rocket.getWorldPosition(lastRocketPosition);

    if(MOV_CONTROL_BTN_LEFT){
        aux_rocket.rotation.z += speed*delta;
        if(Math.cos(aux_rocket.rotation.z) < maxAngleCos){
            aux_rocket.rotation.z -= speed*delta;
        }
        MOV_CONTROL_BTN_LEFT = !MOV_CONTROL_BTN_LEFT;
        cameraMoving.position.x = rocket.position.x + 10;
        cameraMoving.position.y = rocket.position.y - 10;
        cameraMoving.rotation.x = Math.PI/4;
        cameraMoving.rotation.y = Math.PI/4;
    }
    if(MOV_CONTROL_BTN_RIGHT){
        aux_rocket.rotation.z -= speed*delta;
        if(Math.cos(aux_rocket.rotation.z) < maxAngleCos){
            aux_rocket.rotation.z += speed*delta;
        }
        MOV_CONTROL_BTN_RIGHT = !MOV_CONTROL_BTN_RIGHT;
        cameraMoving.position.x = rocket.position.x - 10;
        cameraMoving.position.y = rocket.position.y - 10;
        cameraMoving.rotation.x = Math.PI/4;
        cameraMoving.rotation.y = -Math.PI/4;
    }
    if(MOV_CONTROL_BTN_UP){
        aux_rocket.rotation.y += speed*delta;
        MOV_CONTROL_BTN_UP = !MOV_CONTROL_BTN_UP;
        cameraMoving.position.x = rocket.position.x;
        cameraMoving.position.y = rocket.position.y -10;
        cameraMoving.rotation.x = Math.PI/4;
        cameraMoving.rotation.y = 0;
    }
    if(MOV_CONTROL_BTN_DOWN){
        aux_rocket.rotation.y -= speed*delta;
        MOV_CONTROL_BTN_DOWN = !MOV_CONTROL_BTN_DOWN;
        cameraMoving.position.x = rocket.position.x;
        cameraMoving.position.y = rocket.position.y +10;
        cameraMoving.rotation.y = 0;
        cameraMoving.rotation.x = -Math.PI/4;
    }


    let newRocketPosition = new THREE.Vector3();
    rocket.getWorldPosition(newRocketPosition);

    collision();

    //Display
    render();
    requestAnimationFrame(update);
}
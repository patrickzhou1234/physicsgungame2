const canvas = document.getElementById("babcanv"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true);
var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;
    scene.enablePhysics(new BABYLON.Vector3(0,-9.81, 0), new BABYLON.AmmoJSPlugin);
    
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 10, 30, new BABYLON.Vector3(0, 0, 0), scene);
    camera.setPosition(new BABYLON.Vector3(0, 20, -30));
    camera.attachControl(canvas, true);
    camera.keysUp.pop(38);
    camera.keysDown.pop(40);
    camera.keysLeft.pop(37);
    camera.keysRight.pop(39);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 30, height: 30}, scene);
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.MeshImpostor, {mass:0, restitution:0.3}, scene);
    var groundmat = new BABYLON.StandardMaterial("groundmat", scene);
    groundmat.diffuseColor = new BABYLON.Color3(0, 1, 0);
    ground.material = groundmat;
    var wallz = [15, 0, 0, -15];
    var wallrot = [0, 1, 1, 0];
    var wallx = [null, -15, 15, null];
    for (i=0;i<4;i++) {
        var wall = BABYLON.MeshBuilder.CreatePlane("wall", {width:30, height:2}, scene);
        wall.physicsImpostor = new BABYLON.PhysicsImpostor(wall, BABYLON.PhysicsImpostor.MeshImpostor, {mass:0, restitution: 0.9}, scene);
        wall.position.y = 1;
        wall.position.z = wallz[i];
        if (wallrot[i] == 1) {
            wall.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI/2, BABYLON.Space.LOCAL);
        }
        if  (!(wallx[i] == null)) {
            wall.position.x = wallx[i];
        }
    }
    var gunbody = BABYLON.MeshBuilder.CreateCylinder("gunbody", {diameter:2, height:2}, scene);
    gunbody.position.y = 1;
    var gunbodymat = new BABYLON.StandardMaterial("gunbodymat", scene);
    gunbodymat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    gunbody.material = gunbodymat;
    var gunturret = BABYLON.MeshBuilder.CreateCylinder("gunturret", {diameter:1, height:3}, scene);
    gunturret.rotate(new BABYLON.Vector3(0, 0, 1), Math.PI/2, BABYLON.Space.LOCAL);
    gunturret.position.set(1, 1.5, 0);
    gun = BABYLON.Mesh.MergeMeshes([gunbody, gunturret], scene);
    gun.physicsImpostor = new BABYLON.PhysicsImpostor(gun, BABYLON.PhysicsImpostor.MeshImpostor, {mass:1}, scene);

    target = BABYLON.MeshBuilder.CreateBox("target", {height:1, width:1, depth:1}, scene);
    target.parent = gun;
    target.position.x = 6;
    target.position.y = 1.5;
    target.visibility = 0;

    backimpulsetarg = BABYLON.MeshBuilder.CreateBox("backtarg", {height:1, width:1, depth:1}, scene);
    backimpulsetarg.parent = gun;
    backimpulsetarg.position.x = -6;
    backimpulsetarg.position.y = 1;
    backimpulsetarg.visibility = 0;
    return scene;
};

window.onkeydown = function(event) {
    if (event.keyCode == "37") {
        gun.rotate(new BABYLON.Vector3(0, 1, 0), -Math.PI/45, BABYLON.Space.LOCAL);
    }
    if (event.keyCode == "39") {
        gun.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI/45, BABYLON.Space.LOCAL);
    }
    if (event.keyCode == "32") {
        var bullet = BABYLON.MeshBuilder.CreateSphere("bullet", {diameter:1, segments:32}, scene);
        bullet.physicsImpostor = new BABYLON.PhysicsImpostor(bullet, BABYLON.PhysicsImpostor.SphereImpostor, {mass:1, restitution:0.3}, scene);
        bullet.parent = gun;
        bullet.position.x = 3;
        bullet.position.y = 1.5;
        var impulseDir = target.getAbsolutePosition().subtract(bullet.getAbsolutePosition());
        bullet.physicsImpostor.applyImpulse(impulseDir.scale(10), bullet.getAbsolutePosition());
        gun.removeChild(bullet);
    }
    if (event.keyCode == "38") {
        var moveforwardDir = target.getAbsolutePosition().subtract(gun.getAbsolutePosition());
        gun.physicsImpostor.applyImpulse(moveforwardDir.scale(0.01), gun.getAbsolutePosition());
    }
    if (event.keyCode == "40") {
        var movebackwardDir = backimpulsetarg.getAbsolutePosition().subtract(gun.getAbsolutePosition());
        gun.physicsImpostor.applyImpulse(movebackwardDir.scale(0.01), gun.getAbsolutePosition());
    }
}

setInterval(function() {
    var enemy = BABYLON.MeshBuilder.CreateBox("enemy", {width:2, height:2, depth:2}, scene);
    enemy.physicsImpostor = new BABYLON.PhysicsImpostor(enemy, BABYLON.PhysicsImpostor.BoxImpostor, {mass:1, restitution:0.3}, scene);
    var items = Array(1, 2, 3, 4);
    var item = items[Math.floor(Math.random() * items.length)];
    if (item == 1) {
        enemy.position.set(-14, 5, -14);
    }
    if (item == 2) {
        enemy.position.set(14, 5, -14)
    }
    if (item == 3) {
        enemy.position.set(-14, 5, 14)
    }
    if (item == 4) {
        enemy.position.set(14, 5, 14)
    }
    setInterval(function() {
        if (enemy.position.y < -1) {
            return;
        }
        enemy.physicsImpostor.applyImpulse(gun.getAbsolutePosition().subtract(enemy.getAbsolutePosition()).scale(0.04), enemy.getAbsolutePosition());
    }, 100);
}, 10000);

const scene = createScene();

engine.runRenderLoop(function () {
  scene.render();
});

window.addEventListener("resize", function () {
  engine.resize();
});

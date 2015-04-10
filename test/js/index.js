
// code for radar chart
// var data = {
//     labels : ["Eating","Drinking","Sleeping","Designing","Coding","Partying","Running"],
//     datasets : [
//         {
//             fillColor : "rgba(220,220,220,0.5)",
//             strokeColor : "rgba(220,220,220,1)",
//             pointColor : "rgba(220,220,220,1)",
//             pointStrokeColor : "#fff",
//             data : [65,59,90,81,56,55,40]
//         },
//         {
//             fillColor : "rgba(151,187,205,0.5)",
//             strokeColor : "rgba(151,187,205,1)",
//             pointColor : "rgba(151,187,205,1)",
//             pointStrokeColor : "#fff",
//             data : [28,48,40,19,96,27,100]
//         }
//     ]
// };

//Get the context of the canvas element we want to select
// var ctx = document.getElementById("myChart").getContext("2d");
// var myNewChart = new Chart(ctx).Radar(data);

// code for 3d display
var container, stats;

var camera, scene, renderer;

var bottle, plane;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// check if browser supports webgl
// if (Detector.webgl) {
    // console.log(Detector);
    init();
    animate();
// } else {
    // var warning = Detector.getWebGLErrorMessage();
    // document.getElementById('state').innerHTML = 'can not work'
    // document.getElementById('container').appendChild(warning);
// } 

function init() {

    // dom element
    container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0px';
    container.style.width = '100%';
    document.body.appendChild(container);

    var info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = 'Drag to spin the bottle';
    container.appendChild(info);

    // camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.y = 6;
    camera.position.z = 10;

    // scene
    scene = new THREE.Scene();

    var ambient = new THREE.AmbientLight(0x101030);
    scene.add(ambient);

    var directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);

    // load manager
    var manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {
        console.log(item, loaded, total);
    };

    var onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
    };

    var onError = function (xhr) {
        alert('error');
    };

    // texture
    var texture = new THREE.Texture();
    var loader = new THREE.ImageLoader(manager);
    loader.load('../src/test.jpg', function (image) {

        texture.image = image;
        texture.needsUpdate = true;

    });

    // model
    var loader = new THREE.OBJLoader(manager);
    loader.load('../src/b.obj', function (object) {

        object.rotation.z = 0.2;
        object.position.y += 1;


        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material.map = texture;
            }
        });

        scene.add(object);

        bottle = object;
        console.log(object);
    }, onProgress, onError);


    // Plane
    var geometry = new THREE.PlaneBufferGeometry(2, 2);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(- Math.PI / 2));

    var material = new THREE.MeshBasicMaterial({ color: 0xe0e0e0, overdraw: 0.5 });

    plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // renderer = new THREE.WebGLRenderer();

    // Bug: Mobile can not render in CanvasRender
    renderer = new THREE.CanvasRenderer();

    // 
    renderer.setClearColor(0xf0f0f0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);

    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);

    //
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function onDocumentMouseDown(event) {

    event.preventDefault();

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('mouseout', onDocumentMouseOut, false);

    mouseXOnMouseDown = event.clientX - windowHalfX;
    targetRotationOnMouseDown = targetRotation;

}

function onDocumentMouseMove(event) {

    mouseX = event.clientX - windowHalfX;

    targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;

}

function onDocumentMouseUp(event) {

    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);

}

function onDocumentMouseOut(event) {

    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);

}

function onDocumentTouchStart(event) {

    if (event.touches.length === 1) {

        event.preventDefault();
        mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
        targetRotationOnMouseDown = targetRotation;
    }
}

function onDocumentTouchMove(event) {

    if (event.touches.length === 1) {

        event.preventDefault();

        mouseX = event.touches[0].pageX - windowHalfX;
        targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.05;
    }
}

function animate() {

    requestAnimationFrame(animate);
    render();
    stats.update();
}

function render() {

    plane.rotation.y = bottle.rotation.y += (targetRotation - bottle.rotation.y) * 0.05;

    renderer.render(scene, camera);
}
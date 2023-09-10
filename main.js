    import './style.css'
    import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
    import { Water } from 'three/examples/jsm/objects/Water.js';
    import { Sky } from 'three/examples/jsm/objects/Sky.js';
    import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

    let camera, scene, renderer,collectionCounterSprite;
    let controls, water, sun, dolphin;
    let dolphins = []; // 使用一個陣列保存所有海豚模型 
    let bag = [];
    let bottles = [];
    let can = [];
    let cig = [];
    let net = [];
    let trashes = [];
    let wbot = [];
    let collectedTrashCount = 0;

    const dolModal = new bootstrap.Modal(document.getElementById('dolModal'));


    const BAG_COUNT = 5;
    const BOTTLE_COUNT = 5;
    let bottleModel = null;
    const CAN_COUNT = 5;
    const CIG_COUNT = 5;
    const NET_COUNT = 1;
    const TRASH_COUNT = 5;
    const WBOTTLE_COUNT = 5;
    const TOTAL_COUNT =  BAG_COUNT+BOTTLE_COUNT+CAN_COUNT+CIG_COUNT+NET_COUNT+TRASH_COUNT +WBOTTLE_COUNT;

        // 垃圾的區域定義
    const TRASH_BOUNDS = {
        general: { x: [-4700, -4500], z:[1000, 1500] },
        bottle: { x: [-4000, -3500], z:[3200, 3700] },
        bag: { x: [-3000,-2500], z: [3600, 3800]},
        cig: { x: [-2000, -1500], z: [3000, 3500] },
        wbot: { x: [-1000,-500], z: [3700, 3900] },
        can: { x: [0, 500], z: [3000, 3500] },     
        net: { x: [1000, 1500],y:[20], z: [4000, 4500] },

    };


    

    function showLoadingModal() {
      $('#loadingModal').modal({
        backdrop: 'static',
        keyboard: false
      });
    }
    
    function hideLoadingModal() {
      $('#loadingModal').modal('hide');
    }
    

    document.addEventListener("DOMContentLoaded", function() {
    
      showLoadingModal();


    let hasDisplayedTrashModal = false;
    let hasDisplayedBottleModal = false;
    let hasDisplayedWbotModal = false; 
    let hasDisplayedNetModal = false;  
    let hasDisplayedCigModal = false;  
    let hasDisplayedBagModal = false;  
    let hasDisplayedCanModal = false;  


    const loader = new GLTFLoader();
    const airWalls = []; // Array to hold the air walls

        // 監聽模態視窗的 'shown.bs.modal' 事件
        $('.modal').on('shown.bs.modal', function (e) {
          // 當模態視窗打開時，為 document 添加一個 keydown 事件
          document.addEventListener('keydown', closeModalOnEnter);

          // 添加一個事件監聽器來檢測模態視窗外的點擊
          document.addEventListener('click', closeModalOnClickOutside);
      });

      // 監聽模態視窗的 'hidden.bs.modal' 事件
      $('.modal').on('hidden.bs.modal', function (e) {
        // 當模態視窗關閉時，移除添加的事件監聽器
        document.removeEventListener('keydown', closeModalOnEnter);
        document.removeEventListener('click', closeModalOnClickOutside);
    });

    function closeModalOnEnter(e) {
        if (e.key === 'Enter') {
            $('.modal').modal('hide');  // 關閉當前打開的模態視窗
        }
    }

    function closeModalOnClickOutside(e) {
        if (!$(e.target).closest('.modal-content').length) {
            $('.modal').modal('hide');  // 關閉當前打開的模態視窗
        }
    }


    function updateCounterSprite() {
    const newText = `${collectedTrashCount}/${TOTAL_COUNT}`;

    const newSprite = createTextSprite(newText, 200); 
    // 將精靈的位置設置為相對於相機的位置
    newSprite.position.set(camera.position.x + 5, camera.position.y + 2.5, camera.position.z - 5); 
    scene.remove(collectionCounterSprite); 
    collectionCounterSprite = newSprite;
    scene.add(collectionCounterSprite);
    }

    function createAirWall(x, y, z, width, height, depth) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshBasicMaterial({ visible: false }); // Invisible material
        const wall = new THREE.Mesh(geometry, material);
        wall.position.set(x, y, z);
        scene.add(wall);
        airWalls.push(wall);
    }

    function isColliding(obj1, obj2) {
    const obj1Box = new THREE.Box3().setFromObject(obj1);
    const obj2Box = new THREE.Box3().setFromObject(obj2);
    return obj1Box.intersectsBox(obj2Box);
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    function createTextSprite(message, fontSize = 70) {  // 添加 fontSize 參數
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.font = `${fontSize}px Sans-serif`;
      const metrics = context.measureText(message);
      const textWidth = metrics.width;
      const textHeight = fontSize;
      canvas.width = textWidth;
      canvas.height = textHeight;

      context.font = `${fontSize}px Sans-serif`;
      context.fillStyle = 'rgba(255, 0, 0, 1)';  
      context.fillText(message, 0, fontSize);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(textWidth / 10, textHeight / 10, 1);  // 根據字體大小進行調整
      return sprite;
    }

    class Boat {
        constructor() {
            this.previousPosition = new THREE.Vector3();
            this.scaleFactor = 40;  // Set the boat scale factor to 5
    loader.load("assets/boat1/boat1.glb", (gltf) => {
    scene.add(gltf.scene);
    gltf.scene.scale.set(this.scaleFactor, this.scaleFactor, this.scaleFactor);  // Set boat's size to (5, 5, 5)
    gltf.scene.position.set(3200, 0.1 * this.scaleFactor, -2000);
    gltf.scene.rotation.y = 1.5;
                
                
                this.lastTime = 0; // 用於搖晃的時間紀錄
                this.rockingAmount = 0.05; // 設定搖晃的幅度

                this.boat = gltf.scene;
                this.speed = {
                    vel: 0,
                    rot: 0
                };
            });

        }

        stop() {
            this.speed.vel = 0;
            this.speed.rot = 0;
        }

        update() {
            if (this.boat) {
                this.previousPosition.copy(this.boat.position);
                if (this.speed.vel === 0) { 
                    let currentTime = Date.now() * 0.001;
                    this.boat.rotation.x = this.rockingAmount * Math.sin(currentTime);  
                    this.boat.rotation.z = this.rockingAmount * Math.cos(currentTime);  
                    this.lastTime = currentTime;
                } else {
                    this.boat.rotation.x = 0;
                    this.boat.rotation.z = 0;
                }
                this.boat.rotation.y += this.speed.rot;
                this.boat.translateX(this.speed.vel);
            }
        }
    }

    const boat = new Boat();
    let boatModel = null;

    class Trash {
    constructor(_scene,bounds) {
        scene.add(_scene);
        _scene.scale.set(8, 8, 8);
        // 使用 bounds 參數設定位置
        _scene.position.set(random(bounds.x[0], bounds.x[1]), -.5, random(bounds.z[0], bounds.z[1]));


        this.trash = _scene;
        this.createTrashAnimation(); // 創建動畫
    }

    createTrashAnimation() {
        const bobbingTimeline = gsap.timeline({ repeat: -1, yoyo: true });
    
        bobbingTimeline.to(this.trash.position, {
            duration: random(4, 6),
            y: "-=5.0",
            ease: "power1.inOut"
        });
    }
    


    }

    class Bottle extends Trash {
        constructor(_scene,) {
        super(_scene, TRASH_BOUNDS.bottle); // 修改: 傳遞 TRASH_BOUNDS.bottle 給父類的構造函數
        _scene.rotation.x = Math.PI / 2;  // 轉90度橫放
    }

    
    }

    class Bag extends Trash {
        constructor(_scene) {
            super(_scene, TRASH_BOUNDS.bag); // 修改: 傳遞 TRASH_BOUNDS.bottle 給父類的構造函數
            _scene.rotation.x = Math.PI / 2;
        }
    }
    
    class Can extends Trash {
        constructor(_scene) {
            super(_scene, TRASH_BOUNDS.can); // 修改: 傳遞 TRASH_BOUNDS.bottle 給父類的構造函數
        }
    }
    
    class Cig extends Trash {
        constructor(_scene) {
            super(_scene, TRASH_BOUNDS.cig); // 修改: 傳遞 TRASH_BOUNDS.bottle 給父類的構造函數
            _scene.scale.set(3, 3, 3);
        }
    }
    
    class Net extends Trash {
        constructor(_scene) {
            super(_scene, TRASH_BOUNDS.net); // 修改: 傳遞 TRASH_BOUNDS.bottle 給父類的構造函數
            _scene.rotation.x = Math.PI / 2;
            _scene.scale.set(9, 9, 9);
        }
    }
    
    class Wbot extends Trash {
        constructor(_scene) {
            super(_scene, TRASH_BOUNDS.wbot); // 修改: 傳遞 TRASH_BOUNDS.bottle 給父類的構造函數
            _scene.rotation.x = Math.PI / 2;  // 轉90度橫放
            _scene.scale.set(3, 3, 3);

        }
    }
    


    async function createBottle() {
    if (!bottleModel) {
        bottleModel = await loadModel("assets/bottle/Bottle.gltf");
    }
    return new Bottle(bottleModel.clone());  // Reuse the Trash class for bottles
    }



    async function loadModel(url) {
        return new Promise((resolve, reject) => {
            loader.load(url, (gltf) => {
                resolve(gltf.scene);
            });
        });
    }

    async function createTrash() {
        if (!boatModel) {
            boatModel = await loadModel("assets/trash/scene.gltf");
        }
        return new Trash(boatModel.clone(), TRASH_BOUNDS.general); // <- 傳遞 TRASH_BOUNDS.general 作為 bounds
    }
    

    class NewModel {
        constructor(_scene) {
            scene.add(_scene);
            _scene.scale.set(75, 75, 75);
            _scene.position.set(3000, -5, -2600);
            this.newModel = _scene;
            this.boundingBox = new THREE.Box3().setFromObject(this.newModel);  
        }
    }

    let newModel = null;

    async function createNewModel() {
        if (!newModel) {
            newModel = await loadModel("assets/harbor1/harbor1.glb");
        }
        return new NewModel(newModel.clone());
    }

    init();
    animate();

    async function init() {
        
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        document.body.appendChild(renderer.domElement);

        scene = new THREE.Scene();

        collectionCounterSprite = createTextSprite(`0/${TOTAL_COUNT}`, 200);// 調整 "0/10" 的字體大小為 100
        collectionCounterSprite.position.set(window.innerWidth - 150, window.innerHeight - 50, 1); 
        scene.add(collectionCounterSprite);


        const hintSprite = createTextSprite(" Use WASD to NAVIGATE and Q to TOGGLE SOUND");
        hintSprite.position.set(0, 50, -40); // 調整位置，使其在上方
        scene.add(hintSprite);

        setTimeout(() => {  
        hintSprite.visible = false;
        }, 10000);  // 8秒後將提示訊息設置為不可見


        camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
        camera.position.set(30, 30, 100);

        const listener = new THREE.AudioListener();
        camera.add(listener);

        const sound = new THREE.Audio(listener);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('assets/boat_waves.mp3', function(buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0.5);
            sound.play();
        });
        

        sun = new THREE.Vector3();

        const waterGeometry = new THREE.PlaneGeometry(20000, 20000);

        water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load('assets/waternormals.jpg', function (texture) {
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                }),
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: scene.fog !== undefined
            }
        );

        water.rotation.x = -Math.PI / 2;

        scene.add(water);

        const sky = new Sky();
        sky.scale.setScalar(10000);
        scene.add(sky);

        const skyUniforms = sky.material.uniforms;

        skyUniforms['turbidity'].value = 10;
        skyUniforms['rayleigh'].value = 2;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.8;

        const parameters = {
            elevation: 2,
            azimuth: 180
        };

        const pmremGenerator = new THREE.PMREMGenerator(renderer);

        function updateSun() {
            const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
            const theta = THREE.MathUtils.degToRad(parameters.azimuth);

            sun.setFromSphericalCoords(1, phi, theta);

            sky.material.uniforms['sunPosition'].value.copy(sun);
            water.material.uniforms['sunDirection'].value.copy(sun).normalize();

            scene.environment = pmremGenerator.fromScene(sky).texture;
        }

        updateSun();

        controls = new OrbitControls(camera, renderer.domElement);
        controls.maxPolarAngle = Math.PI * 0.495;
        controls.target.set(0, 10, 0);
        controls.minDistance = 40.0;
        controls.maxDistance = 200.0;
        controls.update();

        for (let i = 0; i < TRASH_COUNT; i++) {
            const trash = await createTrash();
            trashes.push(trash);
        }

        for (let i = 0; i < TRASH_COUNT; i++) {
            const newModelObject = await createNewModel();
            trashes.push(newModelObject);
        }

        for (let i = 0; i < BOTTLE_COUNT; i++) {
        const bottle = await createBottle();
        bottles.push(bottle);
        }

            // 創建Net物件
        for (let i = 0; i < NET_COUNT; i++) {
            const netModel = await loadModel("assets/net/net.gltf");
            const netObject = new Net(netModel);
            net.push(netObject);
        }

        // 創建Bag物件
        for (let i = 0; i < BAG_COUNT; i++) {
            const bagModel = await loadModel("assets/bag/bag.gltf");
            const bagObject = new Bag(bagModel);
            bag.push(bagObject);
        }

        // 創建Can物件
        for (let i = 0; i < CAN_COUNT; i++) {
            const canModel = await loadModel("assets/can/can.gltf");
            const canObject = new Can(canModel);
            can.push(canObject);
        }

        // 創建Cig物件
        for (let i = 0; i < CIG_COUNT; i++) {
            const cigModel = await loadModel("assets/cig/cig.gltf");
            const cigObject = new Cig(cigModel);
            cig.push(cigObject);
        }

        // 創建Wbot物件
        for (let i = 0; i < WBOTTLE_COUNT; i++) {
            const wbotModel = await loadModel("assets/wbot/wbot.gltf");
            const wbotObject = new Wbot(wbotModel);
            wbot.push(wbotObject);
        }


     // 在加載海豚模型的部分
loader.load('assets/Dol/Dol.gltf', (gltf) => {
    let originalDolphin = gltf.scene;
    scene.add(originalDolphin);
    originalDolphin.scale.set(10, 10, 10);
    originalDolphin.position.set(1500, 10, -2000);
    dolphins.push(originalDolphin);
    createDolphinAnimation(originalDolphin);

    // 複製模型
    let clonedDolphin = originalDolphin.clone();
    scene.add(clonedDolphin);
    clonedDolphin.position.set(1400, 100, -1800); // 更改複製模型的位置，使其離原始模型有一定距離
    dolphins.push(clonedDolphin);
    createDolphinAnimation(clonedDolphin);
});

function createDolphinAnimation(dolphin) {
    let dolphinTimeline = gsap.timeline({ repeat: -1 });
    let circleRadius = 200;
    let diveDepth = 20;  
    let surfaceHeight = 10;  
    let previousPosition = dolphin.position.clone();  

    dolphinTimeline.to(dolphin.position, {
        duration: 5,
        ease: "power1.inOut",
        onUpdate: function () {
            let progress = this.progress();
            let angle = progress * Math.PI * 2;
            dolphin.position.x = circleRadius * Math.cos(angle);
            dolphin.position.z = -circleRadius * Math.sin(angle);
            dolphin.position.y = surfaceHeight + Math.sin(progress * Math.PI * 8) * diveDepth;  
            
            // 確保模型的頭部朝向運動方向
            let direction = new THREE.Vector3().subVectors(dolphin.position, previousPosition).normalize();
            dolphin.lookAt(dolphin.position.clone().add(direction));
            previousPosition.copy(dolphin.position);  
        }
    });
}


        window.addEventListener('resize', onWindowResize);

        window.addEventListener('keydown', function (e) {
    switch (e.key) {
        case "ArrowUp":
        case "s":
            boat.speed.vel = 30;
            break;
        case "ArrowDown":
        case "w":
            boat.speed.vel = -30;
            break;
        case "ArrowRight":
        case "d":
            boat.speed.rot = -0.15;
            break;
        case "ArrowLeft":
        case "a":
            boat.speed.rot = 0.15;
            break;
        
        case "q":  // 按下Q鍵
            const audioContext = sound.context;  // 取得音效上下文
            if (sound.isPlaying) { 
                sound.pause();  
            } else {  
                audioContext.resume().then(() => {
                    sound.play();  // 當音效上下文恢復後，開始播放音效
                    console.log('AudioContext resumed successfully and sound started playing');
                });
            }
            break;
    }
});

        window.addEventListener('keyup', function (e) {
            switch (e.key) {
                case "ArrowUp":
                case "s":
                case "ArrowDown":
                case "w":
                    boat.speed.vel = 0;
                    break;
                case "ArrowRight":
                case "d":
                case "ArrowLeft":
                case "a":
                    boat.speed.rot = 0;
                    break;
            }
        });

        // Create the air walls around the water
        createAirWall(0, 0, 5000, 10000, 100, 1); // Top wall
        createAirWall(0, 0, -2800, 10000, 100, 1); // Bottom wall
        createAirWall(5000, 0, 0, 1, 100, 10000); // Right wall
        createAirWall(-5000, 0, 0, 1, 100, 10000); // Left wall

        hideLoadingModal();



    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function isCollidingWithWalls(obj) {
        for (let wall of airWalls) {
            const objBox = new THREE.Box3().setFromObject(obj);
            const wallBox = new THREE.Box3().setFromObject(wall);
            if (objBox.intersectsBox(wallBox)) {
                return true;
            }
        }
    return false;
    }

    let hasDisplayedModal = false; // 在全局範圍內添加此變量，確保彈出視窗只顯示一次

    function checkCollisions() {

        if (collectedTrashCount === TOTAL_COUNT) {
            $('#collectedModal').modal('show');
            
            setTimeout(function() {
                $('#collectedModal').modal('hide');
            }, 10000);  // 這裡的3000是3秒，你可以根據需要調整這個時間
        }
        
        if (boat.boat) {
            // Check collision for trashes
            trashes = trashes.filter(trash => {
                if (trash.trash && isColliding(boat.boat, trash.trash)) {
                    boat.boat.position.copy(boat.previousPosition);
                    boat.stop();
                    scene.remove(trash.trash);
                    collectedTrashCount++;
                    updateCounterSprite();
    
                    if (!hasDisplayedTrashModal) {
                        $('#trashModal').modal('show');
                        hasDisplayedTrashModal = true;
                    }
    
                    return false;
                }
                return true;
            });
    
            // Check collision for bottles
            bottles = bottles.filter(bottle => {
                if (bottle.trash && isColliding(boat.boat, bottle.trash)) {
                    boat.boat.position.copy(boat.previousPosition);
                    boat.stop();
                    scene.remove(bottle.trash);
                    collectedTrashCount++;
                    updateCounterSprite();
    
                    if (!hasDisplayedBottleModal) {
                        $('#bottleModal').modal('show');
                        hasDisplayedBottleModal = true;
                    }
    
                    return false;
                }
                return true;
            });
    
            // Check collision for bags
            bag = bag.filter(bagObj => {
                if (bagObj.trash && isColliding(boat.boat, bagObj.trash)) {
                    boat.boat.position.copy(boat.previousPosition);
                    boat.stop();
                    scene.remove(bagObj.trash);
                    collectedTrashCount++;
                    updateCounterSprite();
    
                    if (!hasDisplayedBagModal) {
                        $('#bagModal').modal('show');
                        hasDisplayedBagModal = true;
                    }
    
                    return false;
                }
                return true;
            });
    
            // Check collision for cans
            can = can.filter(canObj => {
                if (canObj.trash && isColliding(boat.boat, canObj.trash)) {
                    boat.boat.position.copy(boat.previousPosition);
                    boat.stop();
                    scene.remove(canObj.trash);
                    collectedTrashCount++;
                    updateCounterSprite();
    
                    if (!hasDisplayedCanModal) {
                        $('#canModal').modal('show');
                        hasDisplayedCanModal = true;
                    }
    
                    return false;
                }
                return true;
            });
    
            // Check collision for cigarettes
            cig = cig.filter(cigObj => {
                if (cigObj.trash && isColliding(boat.boat, cigObj.trash)) {
                    boat.boat.position.copy(boat.previousPosition);
                    boat.stop();
                    scene.remove(cigObj.trash);
                    collectedTrashCount++;
                    updateCounterSprite();
    
                    if (!hasDisplayedCigModal) {
                        $('#cigModal').modal('show');
                        hasDisplayedCigModal = true;
                    }
    
                    return false;
                }
                return true;
            });
    
            // Check collision for nets
            net = net.filter(netObj => {
                if (netObj.trash && isColliding(boat.boat, netObj.trash)) {
                    boat.boat.position.copy(boat.previousPosition);
                    boat.stop();
                    scene.remove(netObj.trash);
                    collectedTrashCount++;
                    updateCounterSprite();
    
                    if (!hasDisplayedNetModal) {
                        $('#netModal').modal('show');
                        hasDisplayedNetModal = true;
                    }
    
                    return false;
                }
                return true;
            });
    
            // Check collision for water bottles
            wbot = wbot.filter(wbotObj => {
                if (wbotObj.trash && isColliding(boat.boat, wbotObj.trash)) {
                    boat.boat.position.copy(boat.previousPosition);
                    boat.stop();
                    scene.remove(wbotObj.trash);
                    collectedTrashCount++;
                    updateCounterSprite();
    
                    if (!hasDisplayedWbotModal) {
                        $('#wbotModal').modal('show');
                        hasDisplayedWbotModal = true;
                    }
    
                    return false;
                }
                return true;
            }
            );

            // Check if boat is within the specified radius
            const distanceFromCenter = boat.boat.position.distanceTo(new THREE.Vector3(0, 0, 0));
            if (distanceFromCenter <= 500) {
                if (!hasDisplayedModal) {  // 確保彈出視窗只顯示一次
                    dolModal.show();
                    hasDisplayedModal = true;
                }
            }


    
            // Check collision with the walls
            if (isCollidingWithWalls(boat.boat)) {
                boat.boat.position.copy(boat.previousPosition);
                boat.stop();
            }
        }
    }
    



    function animate() {
    requestAnimationFrame(animate);

    // 如果船已加載且位於場景中
    if (boat.boat) {
        let boatPosition = boat.boat.position.clone();
        let textOffset = new THREE.Vector3(0, 150, 0);  // 設置 Y 軸的偏移為 150 單位
        let textPosition = boatPosition.add(textOffset);
        collectionCounterSprite.position.copy(textPosition);  // 設置文字精靈的位置為船的上方

        // 調整攝像機為第三人稱視角，並旋轉 270 度（90 + 180）
        let boatDirection = new THREE.Vector3();
        boat.boat.getWorldDirection(boatDirection);
        let boatLeft = new THREE.Vector3();
        boatLeft.crossVectors(boatDirection, new THREE.Vector3(0, 1, 0)).normalize();  // 計算船的左方向

        // 根據船的左方向計算攝像機的偏移
        let leftOffset = boatLeft.multiplyScalar(-500);  // 將攝像機向左移動 200 單位
        let upwardOffset = new THREE.Vector3(0, 50, 0);  // 將攝像機向上移動 50 單位

        let cameraPosition = boatPosition.add(leftOffset).add(upwardOffset);

        camera.position.copy(cameraPosition);
        camera.lookAt(boat.boat.position);
    }

    render();
    boat.update();
    checkCollisions();
    }


    function render() {
        water.material.uniforms['time'].value += 1.0 / 60.0;
        renderer.render(scene, camera);
    }

    function showPopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.style.display = "block";

    const closeBtn = popup.querySelector(".close-btn");
    closeBtn.onclick = function() {
        popup.style.display = "none";
    }
    }

    });
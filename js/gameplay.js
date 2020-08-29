//调色板
var Colors = {
  red: 0xff6666,
  white: 0xffffcc,
  brown: 0xcc9966,
  pink: 0xffcccc,
  brownDark: 0xcc9966,
  blue: 0x68c3c0,
}

// 变量

var scene, // 场景
  camera, // 相机
  fieldOfView, // 视野
  aspectRatio, // 宽高比
  renderer, // 渲染
  container, // 存world元素
  HEIGHT, // 屏幕高度
  WIDTH, // 屏幕宽度
  mousePos = { x: 0, y: 0 }, // 鼠标屏幕坐标
  point_count = 0, // 分数点数
  health = 100, // 血量
  game_distance = 0, // 游戏距离
  game_coinLastSpawn = 0, // 上次生成位置
  game_over = 0 // 游戏结束标志

//创建场景
function createScene() {
  //设置宽高
  HEIGHT = window.innerHeight
  WIDTH = window.innerWidth

  scene = new THREE.Scene()
  scene.fog = new THREE.Fog(0xf7d9aa, 100, 950)

  //测试用
  // var axes = new THREE.AxisHelper(200) //场景中添加一个三维坐标系，便于观察图形的位置
  // scene.add(axes)

  //创建相机
  aspectRatio = WIDTH / HEIGHT // 宽高比
  fieldOfView = 100 //视野
  camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio)
  camera.lookAt({
    //相机看向哪个坐标
    x: 1,
    y: 0,
    z: 0,
  })

  //相机位置
  camera.position.x = -300 //红色线
  camera.position.z = 0 //蓝色线
  camera.position.y = 250 //绿色线

  //跟着教程来，暂时不太看得懂
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(WIDTH, HEIGHT)
  renderer.shadowMap.enabled = true

  //渲染后加入DOM
  container = document.getElementById("world")
  container.appendChild(renderer.domElement)

  window.addEventListener("resize", handleWindowResize, false)
}

// 处理屏幕缩放

function handleWindowResize() {
  HEIGHT = window.innerHeight
  WIDTH = window.innerWidth
  renderer.setSize(WIDTH, HEIGHT)
  camera.aspect = WIDTH / HEIGHT
  camera.updateProjectionMatrix()
}

// 光照 暂时看不懂

var ambientLight, hemisphereLight, shadowLight

function createLights() {
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9)
  shadowLight = new THREE.DirectionalLight(0xffffff, 0.9)
  shadowLight.position.set(150, 350, 350)
  shadowLight.castShadow = true
  shadowLight.shadow.camera.left = -400
  shadowLight.shadow.camera.right = 400
  shadowLight.shadow.camera.top = 400
  shadowLight.shadow.camera.bottom = -400
  shadowLight.shadow.camera.near = 1
  shadowLight.shadow.camera.far = 1000
  shadowLight.shadow.mapSize.width = 2048
  shadowLight.shadow.mapSize.height = 2048

  scene.add(hemisphereLight)
  scene.add(shadowLight)
}

//采用几何体拼接的方式制作一个飞机模型 x-wing
// BoxGeometry(width, height, dept, widthSegments, heightSegments, depthSegments)
var AirPlane = function () {
  this.mesh = new THREE.Object3D()
  this.mesh.name = "airPlane"

  // 主体
  var geomCockpit = new THREE.BoxGeometry(60, 50, 50, 1, 1, 1)
  var matCockpit = new THREE.MeshPhongMaterial({
    color: Colors.red,
    shading: THREE.FlatShading,
  })
  geomCockpit.vertices[4].y -= 10
  geomCockpit.vertices[4].z += 20
  geomCockpit.vertices[5].y -= 10
  geomCockpit.vertices[5].z -= 20
  geomCockpit.vertices[6].y += 30
  geomCockpit.vertices[6].z += 20
  geomCockpit.vertices[7].y += 30
  geomCockpit.vertices[7].z -= 20
  var cockpit = new THREE.Mesh(geomCockpit, matCockpit)
  cockpit.castShadow = true
  cockpit.receiveShadow = true
  this.mesh.add(cockpit)
  var geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1)
  var matEngine = new THREE.MeshPhongMaterial({
    color: Colors.white,
    shading: THREE.FlatShading,
  })
  var engine = new THREE.Mesh(geomEngine, matEngine)
  engine.position.x = 40
  engine.castShadow = true
  engine.receiveShadow = true
  this.mesh.add(engine)

  // 尾流板

  var geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1)
  var matTailPlane = new THREE.MeshPhongMaterial({
    color: Colors.red,
    shading: THREE.FlatShading,
  })
  var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane)
  tailPlane.position.set(-35, 25, 0)
  tailPlane.castShadow = true
  tailPlane.receiveShadow = true
  this.mesh.add(tailPlane)

  // 机翼

  var geomSideWing = new THREE.BoxGeometry(20, 8, 300, 1, 1, 1)
  var matSideWing = new THREE.MeshPhongMaterial({
    color: Colors.red,
    shading: THREE.FlatShading,
  })
  geomSideWing.vertices[0].z -= 40
  geomSideWing.vertices[5].z -= 40
  geomSideWing.vertices[7].z -= 40
  geomSideWing.vertices[2].z -= 40

  var sideWing = new THREE.Mesh(geomSideWing, matSideWing)
  sideWing.position.set(0, 0, 0)
  sideWing.castShadow = true
  sideWing.receiveShadow = true
  sideWing.rotation.x = Math.PI / 6
  this.mesh.add(sideWing)

  var geomSideWing1 = new THREE.BoxGeometry(20, 8, 300, 1, 1, 1)
  var matSideWing1 = new THREE.MeshPhongMaterial({
    color: Colors.red,
    shading: THREE.FlatShading,
  })
  geomSideWing1.vertices[1].z += 40
  geomSideWing1.vertices[4].z += 40
  geomSideWing1.vertices[3].z += 40
  geomSideWing1.vertices[6].z += 40
  var sideWing1 = new THREE.Mesh(geomSideWing1, matSideWing1)
  sideWing1.position.set(0, 0, 0)
  sideWing1.castShadow = true
  sideWing1.receiveShadow = true
  sideWing1.rotation.x = -Math.PI / 6
  this.mesh.add(sideWing1)

  // 螺旋桨

  var geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1)
  var matPropeller = new THREE.MeshPhongMaterial({
    color: Colors.brown,
    shading: THREE.FlatShading,
  })
  this.propeller = new THREE.Mesh(geomPropeller, matPropeller)
  this.propeller.castShadow = true
  this.propeller.receiveShadow = true
  var geomBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1)
  var matBlade = new THREE.MeshPhongMaterial({
    color: Colors.brownDark,
    shading: THREE.FlatShading,
  })
  var blade = new THREE.Mesh(geomBlade, matBlade)
  blade.position.set(8, 0, 0)
  blade.castShadow = true
  blade.receiveShadow = true
  this.propeller.add(blade)
  this.propeller.position.set(50, 0, 0)
  this.mesh.add(this.propeller)
}

// 天空对象构造函数
Sky = function () {
  this.mesh = new THREE.Object3D()
  this.nClouds = 100
  this.clouds = []
  var stepAngle = (Math.PI * 2) / this.nClouds
}
// 海元素构造
Sea = function () {
  var geom = new THREE.CylinderGeometry(600, 600, 3000, 40, 10) //创造几何体圆柱
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2)) //在x轴上旋转
  geom.mergeVertices()
  var mat = new THREE.MeshPhongMaterial({
    //材质-颜色-透明度0.6
    color: Colors.blue,
    transparent: true,
    opacity: 0.6,
    shading: THREE.FlatShading,
  })
  this.mesh = new THREE.Mesh(geom, mat) //mesh
  this.mesh.receiveShadow = true //shadow投影接收
  this.nMount = 100
  this.mounts = []
  var stepAngleM = (Math.PI * 2) / this.nMount
  for (var i = 0; i < this.nMount; i++) {
    var mount = new Mount()
    this.mounts.push(mount)
    var a = stepAngleM * i
    var h = 600
    mount.mesh.position.x = Math.sin(a) * h
    mount.mesh.position.y = Math.cos(a) * h
    mount.mesh.position.z = 400 + Math.random() * 800
    var s = 1 + Math.random() * 2
    mount.mesh.scale.set(s, s, s)
    this.mesh.add(mount.mesh)
  }
  for (var i = 0; i < this.nMount; i++) {
    var mount = new Mount()
    this.mounts.push(mount)
    var a = stepAngleM * i
    var h = 600
    mount.mesh.position.y = Math.sin(a) * h
    mount.mesh.position.x = Math.cos(a) * h
    mount.mesh.position.z = -400 - Math.random() * 800
    mount.mesh.rotation.z = a + Math.PI / 2
    var s = 1 + Math.random() * 2
    mount.mesh.scale.set(s, s, s)
    this.mesh.add(mount.mesh)
  }
}

// 小岛构造
Mount = function () {
  this.mesh = new THREE.Object3D()
  this.mesh.name = "mount"
  var geom = new THREE.CubeGeometry(50, 50, 50)
  geom.vertices[0].x -= 10
  geom.vertices[0].z -= 20
  geom.vertices[1].x -= 10
  geom.vertices[1].z += 20
  geom.vertices[4].x += 30
  geom.vertices[4].z -= 20
  geom.vertices[5].x += 30
  geom.vertices[5].z += 20
  var mat = new THREE.MeshPhongMaterial({
    color: Colors.white,
    shading: THREE.FlatShading,
  })
  this.mesh.receiveShadow = true //shadow投影接收
  var nBlocs = Math.floor(Math.random() * 3)
  for (var i = 0; i < nBlocs; i++) {
    var m = new THREE.Mesh(geom.clone(), mat)
    m.position.x = i * 30
    m.position.y = Math.random() * 10
    m.position.z = Math.random() * 10
    var s = 0.1 + Math.random() * 0.9
    m.scale.set(s, s, s)
    m.castShadow = true
    m.receiveShadow = true
    this.mesh.add(m)
  }
}
// 创建分
Coin = function () {
  var geom = new THREE.TetrahedronGeometry(5, 0)
  var mat = new THREE.MeshPhongMaterial({
    color: 0x009999,
    shininess: 0,
    specular: 0xffffff,

    shading: THREE.FlatShading,
  })
  this.mesh = new THREE.Mesh(geom, mat)
  this.mesh.castShadow = true
}
// 利用holder来存coin，便于管理mesh
CoinsHolder = function (nCoins) {
  this.mesh = new THREE.Object3D()
  this.coinsInUse = []
  this.coinsPool = []
  for (var i = 0; i < nCoins; i++) {
    var coin = new Coin()
    this.coinsPool.push(coin)
  }
}
// 生成分
CoinsHolder.prototype.spawnCoins = function () {
  //console.log("in ner create")
  var nCoins = 1 + Math.floor(Math.random() * 10)
  for (var i = 0; i < nCoins; i++) {
    var coin
    if (this.coinsPool.length) {
      coin = this.coinsPool.pop()
    } else {
      coin = new Coin()
    }
    this.mesh.add(coin.mesh)
    this.coinsInUse.push(coin)
    coin.mesh.position.y = 20 + Math.random() * 140
    coin.mesh.position.z = -280 + Math.random() * 560
    coin.mesh.position.x = 300
    console.log(
      coin.mesh.position.x,
      coin.mesh.position.y,
      coin.mesh.position.z
    )
  }
}
// 刷新分位置，检测处理碰撞
CoinsHolder.prototype.refreshCoins = function () {
  for (var i = 0; i < this.coinsInUse.length; i++) {
    var coin = this.coinsInUse[i]
    coin.mesh.position.x -= 1+0.01*game_distance
    var diffPos = airplane.mesh.position.clone().sub(coin.mesh.position.clone())
    var d = diffPos.length()
    if (d < 100) {
      this.coinsPool.unshift(this.coinsInUse.splice(i, 1)[0])
      this.mesh.remove(coin.mesh)
      point_count++
      i--
    } else if (coin.mesh.position.x < -200) {
      this.coinsPool.unshift(this.coinsInUse.splice(i, 1)[0])
      this.mesh.remove(coin.mesh)
      i--
    }
  }
}
// 石头构造函数
Stone = function () {
  var geom = new THREE.TetrahedronGeometry(10, 0)
  var mat = new THREE.MeshPhongMaterial({
    color: 0xf25346,
    shininess: 0,
    specular: 0xffffff,
    shading: THREE.FlatShading,
  })
  this.mesh = new THREE.Mesh(geom, mat)
  this.mesh.castShadow = true
}

StonesHolder = function (nStones) {
  this.mesh = new THREE.Object3D()
  this.StonesInUse = []
  this.StonesPool = []
  for (var i = 0; i < nStones; i++) {
    var stone = new Stone()
    this.StonesPool.push(stone)
  }
}
// 生成石头
StonesHolder.prototype.spawnStones = function () {
  //console.log("in ner create")
  var nStones = 1
  for (var i = 0; i < nStones; i++) {
    var Stone
    if (this.StonesPool.length) {
      Stone = this.StonesPool.pop()
    } else {
      Stone = new Stone()
    }
    this.mesh.add(Stone.mesh)
    this.StonesInUse.push(Stone)
    Stone.mesh.position.y = 20 + Math.random() * 140
    Stone.mesh.position.z = -280 + Math.random() * 560
    Stone.mesh.position.x = 300
  }
}
// 刷新石头位置，判断碰撞
StonesHolder.prototype.refreshStones = function () {
  for (var i = 0; i < this.StonesInUse.length; i++) {
    var Stone = this.StonesInUse[i]
    Stone.mesh.position.x -= 1+0.01*game_distance
    var diffPos = airplane.mesh.position
      .clone()
      .sub(Stone.mesh.position.clone())
    var d = diffPos.length()
    if (d < 60) {
      this.StonesPool.unshift(this.StonesInUse.splice(i, 1)[0])
      this.mesh.remove(Stone.mesh)
      health -= 10
      i--
    } else if (Stone.mesh.position.x < -200) {
      this.StonesPool.unshift(this.StonesInUse.splice(i, 1)[0])
      this.mesh.remove(Stone.mesh)
      i--
    }
  }
}

// 构造各类对象
var sea // 海
var airplane // 飞机

function createPlane() {
  airplane = new AirPlane()
  airplane.mesh.scale.set(0.25, 0.25, 0.25)
  airplane.mesh.position.y = 100
  scene.add(airplane.mesh)
}

function createSea() {
  sea = new Sea()
  sea.mesh.position.y = -600
  scene.add(sea.mesh)
}

function createSky() {
  sky = new Sky()
  sky.mesh.position.y = -600
  scene.add(sky.mesh)
}

function createCoins() {
  coinsHolder = new CoinsHolder(20)
  scene.add(coinsHolder.mesh)
}

function createStones() {
  StonesHolder = new StonesHolder(20)
  scene.add(StonesHolder.mesh)
}

function loop() {
  if (game_over == 0) {
    if (Math.floor(game_distance) > game_coinLastSpawn) {
      //console.log("create!")
      game_coinLastSpawn = Math.floor(game_distance)
      coinsHolder.spawnCoins()
      StonesHolder.spawnStones()
    }
    // 刷新物体
    updatePlane()
    updateDistance()
    coinsHolder.refreshCoins()
    StonesHolder.refreshStones()
    sea.mesh.rotation.z += 0.003+0.00005*game_distance
    sky.mesh.rotation.z += 0.003+0.00005*game_distance
    //console.log(game_distance)

    renderer.render(scene, camera) //渲染场景
    requestAnimationFrame(loop) //再次调用loop函数
  } else if (game_over == 1) {
    replayMessage.style.display = "block"
  }
}

// 控制飞机移动

function handleMouseMove(event) {
  // 将当前鼠标的坐标值转换成webgl系统中规格化的数值-从-1到1
  var tx = -1 + (event.clientX / WIDTH) * 2
  // 奇怪的是y轴是相反的
  var ty = 1 - (event.clientY / HEIGHT) * 2
  mousePos = { x: tx, y: ty }

  // mouseY
  // ------------------------------------
  // |                                   |
  // |                                   |
  // |                                   |
  // |                                   |
  // |              屏幕                 |
  // |                                   |
  // |                                   |
  // |                                   |
  // ------------------------------------mouseX
}

function updatePlane() {
  // 由于视角原因mouseX控制z引擎中的z轴，mouseY控制引擎中的y轴

  var targetY = 110 + mousePos.y * 100 //y轴25到175的位置
  var targetZ = mousePos.x * 300 //z轴-300到300的位置

  // 每一帧移动飞机移动的距离
  airplane.mesh.position.y += (targetY - airplane.mesh.position.y) * 0.1
  airplane.mesh.position.z += (targetZ - airplane.mesh.position.z) * 0.03

  // 妙笔！demo中出现的旋转机身的动画，通过计算目标位置和当前位置距离，给mesh加一定比例的rotation
  airplane.mesh.rotation.z = (targetY - airplane.mesh.position.y) * 0.0256
  airplane.mesh.rotation.x = -(airplane.mesh.position.z - targetZ) * 0.0056

  //螺旋桨动画
  airplane.propeller.rotation.x += 0.3

  // Y轴
  // ------------------------------------
  // |                                   |
  // |                                   |
  // |                                   |
  // |                                   |
  // |   X轴        游戏视角              |
  // |   /                               |
  // |  /                                |
  // | /                                 |
  // --------------------------------------Z轴
}
// 更新DOM对象，刷新UI，更新距离
function updateDistance() {
  game_distance += 0.01
  //console.log(game_distance)
  fieldDistance.innerHTML = Math.floor(game_distance)
  fieldPoints.innerHTML = point_count
  fieldHealth.innerHTML = health
  if (health <= 0) {
    game_over = 1
  }
}

window.addEventListener("load", init, false)

var fieldDistance, fieldPoint, fieldHealth, replayMessage

function init(event) {
  document.addEventListener("mousemove", handleMouseMove, false)// 监听鼠标
  fieldDistance = document.getElementById("distValue")
  fieldPoints = document.getElementById("countValue")
  fieldHealth = document.getElementById("healthValue")
  replayMessage = document.getElementById("replayMessage")
  createScene()
  createLights()
  createPlane()
  createSea()
  createSky()
  createCoins()
  createStones()
  loop()
}

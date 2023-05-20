<template>
  <div id="container" ref="container"></div>
</template>

<script>
import { onMounted, ref } from 'vue'
import { AxesHelper, PerspectiveCamera, Scene, sRGBEncoding, WebGLRenderer, MeshStandardMaterial, MeshBasicMaterial, TextureLoader, MeshPhongMaterial, Clock, AmbientLight, PointLight, Vector2, Raycaster, BoxGeometry, Mesh, Object3D, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import JoyStick from '../js/joystick'
import * as dat from 'dat.gui'

export default {
  // setup函数是处于 生命周期函数 beforeCreate 和 Created 两个钩子函数之前的函数
  setup() {
    let camera, renderer, scene, drawChild = []
    let controls
    let pointLight1, pointLight2, pointLight3
    let pointLight4, pointLight5, pointLight6
    let pointLight7
    let ambientLight
    let clock = new Clock()
    let player, activeCamera
    let colliders = [] //碰撞物
    const container = ref(null);
    // let speed = 6 //移动速度   let turnSpeed = 2
    let speed = 6 //移动速度
    let turnSpeed = 1
    let move = {
      forward: 0,
      turn: 0
    }
    let joystick //移动设备控制器
    let ctrgui = {
      cameraX: 0.01,
      cameraY: 0.01,
      cameraZ: 0.01
    };

    init()
    function init() {
      clear();
      createScene();
      createObjects();
      createColliders();
      createPlayer();
      createCamera();
      createLights();
      createControls();
      createEvents();
      createJoyStick();
      cteateGui()
    };
    onMounted(() => {
      render()
    })

    function cteateGui() {
      const gui = new dat.GUI();

      gui.add(ctrgui, "cameraX").listen()
      gui.add(ctrgui, "cameraY").listen()
      gui.add(ctrgui, "cameraZ").listen()
    }

    function createJoyStick() {
      joystick = new JoyStick({
        onMove: function (forward, turn) {
          turn = -turn
          if (Math.abs(forward) < 0.3) forward = 0
          if (Math.abs(turn) < 0.1) turn = 0
          move.forward = forward
          move.turn = turn
        }
      })
    }

    function createLights() {
      ambientLight = new AmbientLight(0xe0ffff, 0.6)
      scene.add(ambientLight)

      pointLight1 = new PointLight(0xe0ffff, 0.1, 20)
      pointLight1.position.set(-2, 3, 2)

      scene.add(pointLight1)

      pointLight2 = new PointLight(0xe0ffff, 0.1, 20)
      pointLight2.position.set(0, 3, -6)
      scene.add(pointLight2)

      pointLight3 = new PointLight(0xe0ffff, 0.1, 20)
      pointLight3.position.set(-12, 3, 6)
      scene.add(pointLight3)

      pointLight4 = new PointLight(0xe0ffff, 0.1, 20)
      pointLight4.position.set(-12, 4, -4)
      scene.add(pointLight4)

      pointLight5 = new PointLight(0xe0ffff, 0.1, 20)
      pointLight5.position.set(12, 4, -8)
      scene.add(pointLight5)

      pointLight6 = new PointLight(0xe0ffff, 0.1, 20)
      pointLight6.position.set(12, 4, 0)
      scene.add(pointLight6)

      pointLight7 = new PointLight(0xe0ffff, 0.1, 20)
      pointLight7.position.set(12, 4, 8)
      scene.add(pointLight7)
    }

    function createEvents() {
      document.addEventListener('keydown', onKeyDown)
      document.addEventListener('keyup', onKeyUp)
      //点击模型
      document.addEventListener('click', onmodelclick);
    }
    function onKeyDown(event) {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          move.forward = 1
          break

        case 'ArrowLeft':
        case 'KeyA':
          move.turn = turnSpeed
          break

        case 'ArrowDown':
        case 'KeyS':
          move.forward = -1
          break

        case 'ArrowRight':
        case 'KeyD':
          move.turn = -turnSpeed
          break
        case 'Space':
          break
      }
    }

    function onKeyUp(event) {
      switch (event.code) {

        case 'ArrowUp':
        case 'KeyW':
          move.forward = 0
          break

        case 'ArrowLeft':
        case 'KeyA':
          move.turn = 0
          break

        case 'ArrowDown':
        case 'KeyS':
          move.forward = 0
          break

        case 'ArrowRight':
        case 'KeyD':
          move.turn = 0
          break

      }
    }

    //获取在射线上的接触点
    function onmodelclick(event) {
      //获取鼠标坐标
      var mouse = new Vector2();

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      var raycaster = new Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(drawChild);
      console.log(intersects);
    }

    function createControls() {
      controls = new OrbitControls(camera, renderer.domElement)
      // controls.addEventListener('change', render);//监听鼠标、键盘事件
    }

    function createScene() {
      renderer = new WebGLRenderer({
        antialias: false
      })
      renderer.outputEncoding = sRGBEncoding
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(window.devicePixelRatio)

      camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000)
      camera.position.set(-10, 2, 10)

      scene = new Scene()

      //坐标轴辅助
      // AxesHelper( size : Number ), size -- (可选的) 表示代表轴的线段长度. 默认为 1.
      var axes = new AxesHelper(30);
      scene.add(axes);

      window.addEventListener('resize', onResize)
    }

    function createColliders() {
      const loader = new GLTFLoader()
      loader.load(
        'static/model/collider.glb',
        gltf => {
          gltf.scene.traverse(child => {
            if (child.name.includes('collider')) {
              colliders.push(child)
            }
          })
          colliders.forEach(item => {
            item.visible = false
            scene.add(item)
          })
        }
      )
    }

    function createPlayer() {
      const geometry = new BoxGeometry(1, 2, 1)
      const material = new MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
      })

      player = new Mesh(geometry, material)
      player.name = 'player'
      // translate()移动当前几何体。该操作通常在一次处理中完成，但不会在渲染过程中处理。
      geometry.translate(0, 1, 0)
      // player.position.set(-5, 0, 5)
      player.position.set(-5, 0, 7)

      // scene.add(player)
    }

    function createCamera() {
      // Object3D() 这是Three.js中大部分对象的基类，提供了一系列的属性和方法来对三维空间中的物体进行操纵。
      const back = new Object3D()
      // activeCamera的position z轴值即为相机位置position和相机焦点lookat之间的距离，距离越大可视范围越小
      // back.position.set(0, 2, 1)
      back.position.set(0, 2, 1)
      // 在scene graph（场景图）中，一个对象的父级对象。 一个对象最多仅能有一个父级对象。
      back.parent = player
      player.add(back)
      activeCamera = back
    }

    function createObjects() {
      const loader = new GLTFLoader()
      loader.load('static/model/gallery.glb',
        gltf => {
          console.log('gltf值', gltf)
          // 该方法会变量场景对象中的每个物体，参数是一个回调函数，我们可以依次访问每一个场景中的对象，同样在这里做一些处理
          // traverse函数完全可以用forEach函数替代，效果一样，代码几乎雷同，只不过是用scene对象的children属性获取了所有成员列表
          gltf.scene.traverse(child => {
            console.log('child值', child)
            switch (child.name) {
              case 'walls':
                initWalls(child)
                break
              case 'stairs':
                initStairs(child)
                break
            }
            //设置展画边框贴图
            // includes() 方法用于判断字符串是否包含指定的子字符串。如果找到匹配的字符串则返回 true，否则返回 false。
            if (child.name.includes('paint')) {
              initFrames(child)
            }
            //设置展画图片贴图
            if (child.name.includes('draw')) {
              initDraws(child)
              drawChild.push(child)
              console.log('drawChild值', drawChild)
            }
          })
          scene.add(gltf.scene)
        })
    }

    function initDraws(child) {
      // console.log(child.name.split('draw'))
      const index = child.name.split('draw')[1]
      const texture = new TextureLoader().load(`static/img/${index}.jpg`)
      // drawChild = texture
      texture.encoding = sRGBEncoding
      texture.flipY = false
      const material = new MeshPhongMaterial({
        map: texture
      })
      child.material = material
    }

    function initFrames(child) {
      child.material = new MeshBasicMaterial({
        color: 0x7f5816
      })
    }

    function initStairs(child) {
      child.material = new MeshStandardMaterial({
        color: 0xd1cdb7
      })
      child.material.roughness = 0.5
      child.material.metalness = 0.6
    }

    function initWalls(child) {
      child.material = new MeshStandardMaterial({
        color: 0xffffff
      })
      child.material.roughness = 0.5
      child.material.metalness = 0.6
    }

    function onResize() {
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    function render() {
      container.value.appendChild(renderer.domElement);
      const dt = clock.getDelta()
      // console.log('两帧渲染时间间隔', dt*1000+'毫秒');
      // console.log('查看每秒渲染频率', 1/dt);

      // console.log('camera.position值', camera.position)
      controls.update(dt);
      update(dt)
      // 更新gui数据
      ctrgui.cameraX = camera.position.x
      ctrgui.cameraY = camera.position.y
      ctrgui.cameraZ = camera.position.z

      renderer.render(scene, camera)
      requestAnimationFrame(render)
      // window.requestAnimationFrame(render)
    }

    function update(dt) {
      updatePlayer(dt)
      updateCamera(dt)
    }

    function updatePlayer(dt) {
      const pos = player.position.clone()
      pos.y += 2
      // Vector3() no arguments; will be initialised to (0, 0, 0)
      let dir = new Vector3()
      // console.log(dir)
      player.getWorldDirection(dir)
      // 向量取反，即： x = -x, y = -y , z = -z。
      dir.negate()

      if (move.forward < 0) dir.negate()
      // 这个类用于进行raycasting（光线投射）。 光线投射用于进行鼠标拾取（在三维空间中计算出鼠标移过了什么物体）。
      let raycaster = new Raycaster(pos, dir)
      let blocked = false

      if (colliders.length > 0) {
        const intersect = raycaster.intersectObjects(colliders)
        if (intersect.length > 0) {
          if (intersect[0].distance < 1) {
            blocked = true
          }
        }
      }

      // if(colliders.length > 0) {
      //   //左方向碰撞监测
      //   dir.set(-1, 0, 0)
      //   dir.applyMatrix4(player.matrix)
      //   dir.normalize()
      //   raycaster = new THREE.Raycaster(pos, dir)

      //   let intersect = raycaster.intersectObjects(colliders)
      //   if(intersect.length > 0) {
      //     if(intersect[0].distance < 2) {
      //       player.translateX(2 - intersect[0].distance)
      //     }
      //   }

      //   //右方向碰撞监测
      //   dir.set(1, 0, 0)
      //   dir.applyMatrix4(player.matrix)
      //   dir.normalize()
      //   raycaster = new THREE.Raycaster(pos, dir)

      //   intersect = raycaster.intersectObjects(colliders)
      //   if(intersect.length > 0) {
      //     if(intersect[0].distance < 2) {
      //       player.translateX(intersect[0].distance - 2)
      //     }
      //   }
      // }

      if (!blocked) {
        if (move.forward !== 0) {
          if (move.forward > 0) {
            // 在局部空间中沿着一条轴来平移物体，假设轴已被标准化。沿着Z轴将平移distance个单位。
            player.translateZ(-dt * speed)
          } else {
            player.translateZ(dt * speed * 0.5)
          }
        }
      }

      if (move.turn !== 0) {
        player.rotateY(move.turn * dt)
      }
    }

    function updateCamera(dt) {
      // console.log('player.position值', player.position)
      //更新摄像机
      let worldPosition = new Vector3()
      camera.position.lerp(
        // 执行getWorldPosition方法把模型的世界坐标保存到参数worldPosition中，activeCamera.getWorldPosition(worldPosition)函数返回值即为worldPosition
        // activeCamera的父对象是Player
        activeCamera.getWorldPosition(worldPosition),
        0.08
      )
      // console.log('camera.position值', camera.position)
      // console.log('worldPosition值', worldPosition)
      // console.log('activeCamera.position值', activeCamera.position)
      // console.log('player.position值', player.position)
      const pos = player.position.clone()
      pos.y += 2
      // console.log(pos)
      // camera.lookAt：相机焦点方向，即相机看向哪一个坐标，默认为Z轴负半轴方向。
      // 最新版threejs中，lookat的参数直接给数值，不能使用元组形式。正确使用：camera.lookat(0,0,0),   camera.lookAt(-5, 2, 7)
      camera.lookAt(pos)
    }

    function clear() {
      // querySelector() 方法可以用于返回文档中匹配指定 CSS 选择器的一个元素
      const dg = document.querySelector(".dg");
      if(dg) {
        dg.innerHTML = "";
      }
    }

    return {
      container
    };
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

#container {
  width: 100vw;
  height: 100vh;
  background-color: #f0f0f0;
  /* background: rgb(175, 112, 156); */
}
</style>

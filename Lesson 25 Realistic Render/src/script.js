import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
// import { floor } from 'three/examples/jsm/nodes/Nodes.js'

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const rgbeLoader = new RGBELoader()

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child.isMesh)
        {
            // Activate shadow here
            child.castShadow=true
            child.receiveShadow=true
        }
    })
}

//textures
const textureLoader= new THREE.TextureLoader()
const woodColorTexture= textureLoader.load("/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_diff_1k.jpg")
woodColorTexture.colorSpace=THREE.SRGBColorSpace
const woodAORoughnessMetalnessTexture= textureLoader.load("textures/wood_cabinet_worn_long/wood_cabinet_worn_long_arm_1k.jpg")
const woodNormalTexture= textureLoader.load("textures/wood_cabinet_worn_long/wood_cabinet_worn_long_nor_gl_1k.png")


const brickColorTexture= textureLoader.load("/textures/castle_brick_broken_06/castle_brick_broken_06_diff_1k.jpg")
brickColorTexture.colorSpace=THREE.SRGBColorSpace

const brickAORoughnessMetalnessTexture= textureLoader.load("textures/castle_brick_broken_06/castle_brick_broken_06_arm_1k.jpg")
const brickNormalTexture= textureLoader.load("textures/castle_brick_broken_06/castle_brick_broken_06_nor_gl_1k.png")

/**
 * Environment map
 */
// Intensity
scene.environmentIntensity = 1
gui
    .add(scene, 'environmentIntensity')
    .min(0)
    .max(10)
    .step(0.001)

// HDR (RGBE) equirectangular
rgbeLoader.load('/environmentMaps/0/2k.hdr', (environmentMap) =>
{
    environmentMap.mapping = THREE.EquirectangularReflectionMapping

    scene.background = environmentMap
    scene.environment = environmentMap
})

//Directional light

const directionalLight= new THREE.DirectionalLight("#ffffff",6)
directionalLight.position.set(-4,6.5,2.5)
scene.add(directionalLight)

gui.add(directionalLight,"intensity").min(0).max(10).step(0.001).name("lightIntensity")
gui.add(directionalLight.position,"x").min(-10).max(10).step(0.001).name("light x")
gui.add(directionalLight.position,"y").min(-10).max(10).step(0.001).name("light y")
gui.add(directionalLight.position,"z").min(-10).max(10).step(0.001).name("light z")

//shadows

directionalLight.castShadow=true
directionalLight.shadow.camera.far=15
directionalLight.shadow.mapSize.set(1024,1024)

gui.add(directionalLight,"castShadow")

gui.add(directionalLight.shadow,"normalBias").min(-0.05).max(0.05).step(0.001)
gui.add(directionalLight.shadow,"bias").min(-0.05).max(0.05).step(0.001)


//directional light helper
// const directionalLightHelper= new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(directionalLightHelper)
//
directionalLight.target.position.set(0,4,0)
directionalLight.target.updateMatrixWorld()
// scene.add(directionalLight.target)



/**
 * Models
 */
// Helmet
gltfLoader.load(
    '/models/hamburger.glb',
    (gltf) =>
    {
        gltf.scene.scale.set(0.5, 0.5, 0.5)
        scene.add(gltf.scene)

        updateAllMaterials()
    }
)

//floor plane 
const planeGeometry= new THREE.PlaneGeometry(8,8)
const floorMaterial=new THREE.MeshStandardMaterial()
floorMaterial.aoMap=woodAORoughnessMetalnessTexture
floorMaterial.roughnessMap=woodAORoughnessMetalnessTexture
floorMaterial.metalnessMap=woodAORoughnessMetalnessTexture
floorMaterial.normalMap= woodNormalTexture
floorMaterial.map=woodColorTexture


const floor= new THREE.Mesh(
    planeGeometry,floorMaterial
)
floor.rotation.x=-Math.PI*0.5
scene.add(floor)

//wall plane 
// const planeGeometry= new THREE.PlaneGeometry(8,8)
const wallMaterial=new THREE.MeshStandardMaterial()
wallMaterial.aoMap=brickAORoughnessMetalnessTexture
wallMaterial.roughnessMap=brickAORoughnessMetalnessTexture
wallMaterial.metalnessMap=brickAORoughnessMetalnessTexture
wallMaterial.normalMap= brickNormalTexture
wallMaterial.map=brickColorTexture



const wall= new THREE.Mesh(
    planeGeometry,wallMaterial
)
wall.position.set(0,4,-4)
scene.add(wall)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 5, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias:true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//shadows

renderer.shadowMap.enabled=true
renderer.shadowMap.type=THREE.PCFSoftShadowMap

//TONE MAPPING
renderer.toneMapping= THREE.ReinhardToneMapping
renderer.toneMappingExposure= 3
gui.add( renderer,'toneMapping',{
    No:THREE.NoToneMapping,
    Linear:THREE.LinearToneMapping,
    Reinhard:THREE.ReinhardToneMapping,
    Cineon:THREE.CineonToneMapping,
    ACESFilmic:THREE.ACESFilmicToneMapping
})

gui.add(renderer,"toneMappingExposure").min(0).max(10).step(0.001)




/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
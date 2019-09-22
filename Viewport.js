import * as THREE from 'three'

export default class Viewport {

  constructor (canvas, scene) {
    this.width = null
    this.height = null
    this.aspectRatio = null

    this.canvas = canvas
    this.renderer = new THREE.WebGLRenderer({ canvas })
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.scene = scene
    this.camera = new THREE.PerspectiveCamera(50, 1, 1, 2000);
    this.camera.position.set(4, 8, 10);

    this.resize()
  }

  resize () {
    this.canvas.style.width = ''
    this.canvas.style.height = ''
	  this.width = this.canvas.offsetWidth
    this.height = this.canvas.offsetHeight
    this.renderer.setSize(this.width, this.height)

    this.aspectRatio = this.width / this.height
    this.camera.aspect = this.aspectRatio
    this.camera.updateProjectionMatrix()

    this.render()
  }

  render () {

    this.renderer.render(this.scene, this.camera)

    return this.renderer.info;
    
  }

}

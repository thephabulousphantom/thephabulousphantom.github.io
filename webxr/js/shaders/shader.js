import * as THREE from "three";

export default class Shader {

    uniforms = "";
    vertexShader = "";
    fragmentShader = "";

    constructor(uniforms, vertexShader, fragmentShader) {
        
        this.uniforms = uniforms;
        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;
    }

    getMaterial() {

        const material = new THREE.ShaderMaterial({

            uniforms: this.uniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader
        });

        material.copy = function(srcMaterial) {

            this.uniforms.map.value = srcMaterial.map;
            this.uniforms.map.value.colorSpace = THREE.LinearSRGBColorSpace;
            this.uniforms.map.value.flipY = false;
        }

        return material;
    }
}
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

        return new THREE.ShaderMaterial({

            uniforms: this.uniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader
        });
    }
}
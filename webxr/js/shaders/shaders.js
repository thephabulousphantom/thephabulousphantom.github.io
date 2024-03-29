import * as THREE from "three";
import Shader from "./shader.js";

export const BasicShader = new Shader(
    {
        map: { type: "t", value: null },
    },
    `
        varying vec2 vUv;

        void main() {

            vUv = uv1;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    `
        varying vec2 vUv;
        uniform sampler2D map;

        void main() {

            gl_FragColor = texture2D(map, vUv);
        }
    `
);

export const StripedShader = new Shader(
    {
        map: { type: "t", value: null },
    },
    `
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {

            vUv = uv1;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    `
        varying vec2 vUv;
        uniform sampler2D map;
        varying vec3 vPosition;

        float random (in vec2 st) {
            return fract(sin(dot(st.xy,
                                    vec2(12.9898,78.233)))
                        * 43758.5453123);
        }
        
        // Value noise by Inigo Quilez - iq/2013
        // https://www.shadertoy.com/view/lsf3WH
        float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            vec2 u = f*f*(3.0-2.0*f);
            return mix( mix( random( i + vec2(0.0,0.0) ),
                                random( i + vec2(1.0,0.0) ), u.x),
                        mix( random( i + vec2(0.0,1.0) ),
                                random( i + vec2(1.0,1.0) ), u.x), u.y);
        }

        mat2 rotate2d(float angle){
            return mat2(cos(angle),-sin(angle),
                        sin(angle),cos(angle));
        }
        
        float lines(in vec2 pos, float b){
            float scale = 10.0;
            pos *= scale;
            return smoothstep(0.0,
                            .5+b*.5,
                            abs((sin(pos.x*3.1415)+b*2.0))*.5);
        }

        void main() {

            vec2 u_resolution = vec2(.4,.4);
            
            vec2 st = vUv/u_resolution.xy;
            st.y *= u_resolution.y/u_resolution.x;

            vec2 pos = st.yx*vec2(10.,3.);

            float pattern = pos.x;

            // Add noise
            pos = rotate2d( noise(pos) ) * pos;

            // Draw lines
            pattern = lines(pos,.5);
            if (pattern > 0.5) {

                pattern = 1.0;
            }
            else {

                pattern = 0.0;
            } 
            pattern = pattern * 0.01;

            vec3 rgbTexture = texture2D(map, vUv).rgb;
            gl_FragColor = vec4(rgbTexture.r + pattern, rgbTexture.g + pattern, rgbTexture.b + pattern, 1.0);
        }
    `
);

export const Noise2dShader = new Shader(
    {
        map: { type: "t", value: null },
        pointLightPosition: { type: "v3v", value: new THREE.Vector3(0, 0, 0)},
        pointLightColor: { type: "v3v", value: new THREE.Vector3(0, 0, 0)},
    },
    `
        varying vec2 vUv;
        varying vec4 ecPos;

        void main() {

            vUv = uv1;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    `
        varying vec2 vUv;
        uniform sampler2D map;

        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                                0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                                -0.577350269189626,  // -1.0 + 2.0 * C.x
                                0.024390243902439); // 1.0 / 41.0
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i); // Avoid truncation effects in permutation
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                + i.x + vec3(0.0, i1.x, 1.0 ));
        
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        void main() {

            vec3 rgbColor = texture2D(map, vUv).rgb;
            
            float noise = snoise(vUv * 50.0);
            if (noise < 0.0) {

                noise = 1.0;
            }
            else {

                noise = 0.0;
            }

            noise = 0.8 + noise * 0.2;

            gl_FragColor = vec4(rgbColor.r * noise, rgbColor.g * noise, rgbColor.b * noise, 1.0);
        }
    `
);

export const Noise3dShader = new Shader(
    {
        map: { type: "t", value: null },
        pointLightPosition: { type: "v3v", value: new THREE.Vector3(0, 0, 0)},
        pointLightColor: { type: "v3v", value: new THREE.Vector3(0, 0, 0)},
    },
    `
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {

            vUv = uv1;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform sampler2D map;

        //	Classic Perlin 3D Noise 
        //	by Stefan Gustavson
        //
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

        float cnoise(vec3 P){
            vec3 Pi0 = floor(P); // Integer part for indexing
            vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
            Pi0 = mod(Pi0, 289.0);
            Pi1 = mod(Pi1, 289.0);
            vec3 Pf0 = fract(P); // Fractional part for interpolation
            vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
            vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
            vec4 iy = vec4(Pi0.yy, Pi1.yy);
            vec4 iz0 = Pi0.zzzz;
            vec4 iz1 = Pi1.zzzz;

            vec4 ixy = permute(permute(ix) + iy);
            vec4 ixy0 = permute(ixy + iz0);
            vec4 ixy1 = permute(ixy + iz1);

            vec4 gx0 = ixy0 / 7.0;
            vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
            gx0 = fract(gx0);
            vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
            vec4 sz0 = step(gz0, vec4(0.0));
            gx0 -= sz0 * (step(0.0, gx0) - 0.5);
            gy0 -= sz0 * (step(0.0, gy0) - 0.5);

            vec4 gx1 = ixy1 / 7.0;
            vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
            gx1 = fract(gx1);
            vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
            vec4 sz1 = step(gz1, vec4(0.0));
            gx1 -= sz1 * (step(0.0, gx1) - 0.5);
            gy1 -= sz1 * (step(0.0, gy1) - 0.5);

            vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
            vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
            vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
            vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
            vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
            vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
            vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
            vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

            vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
            g000 *= norm0.x;
            g010 *= norm0.y;
            g100 *= norm0.z;
            g110 *= norm0.w;
            vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
            g001 *= norm1.x;
            g011 *= norm1.y;
            g101 *= norm1.z;
            g111 *= norm1.w;

            float n000 = dot(g000, Pf0);
            float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
            float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
            float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
            float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
            float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
            float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
            float n111 = dot(g111, Pf1);

            vec3 fade_xyz = fade(Pf0);
            vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
            vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
            float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
            return 2.2 * n_xyz;
        }

        void main() {

            vec3 rgbColor = texture2D(map, vUv).rgb;
            
            float noise = cnoise(vPosition * 5.0);
            if (noise < 0.0) {

                noise = 1.0;
            }
            else {

                noise = 0.0;
            }

            noise = 0.8 + noise * 0.2;

            gl_FragColor = vec4(rgbColor.r * noise, rgbColor.g * noise, rgbColor.b * noise, 1.0);
        }
    `
);

export const NoiseShader = new Shader(
    {
        map: { type: "t", value: null },
        pointLightPosition: { type: "v3v", value: new THREE.Vector3(0, 0, 0)},
        pointLightColor: { type: "v3v", value: new THREE.Vector3(0, 0, 0)},
    },
    `
        precision highp float;

        varying vec2 vUv;
        varying vec3 vPosition;

        
        void main() {

            vUv = uv1;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    `
        precision highp float;

        varying vec2 vUv;
        varying vec3 vPosition;
        uniform sampler2D map;

        //	Classic Perlin 3D Noise 
        //	by Stefan Gustavson
        //
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

        float cnoise(vec3 P){
            vec3 Pi0 = floor(P); // Integer part for indexing
            vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
            Pi0 = mod(Pi0, 289.0);
            Pi1 = mod(Pi1, 289.0);
            vec3 Pf0 = fract(P); // Fractional part for interpolation
            vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
            vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
            vec4 iy = vec4(Pi0.yy, Pi1.yy);
            vec4 iz0 = Pi0.zzzz;
            vec4 iz1 = Pi1.zzzz;

            vec4 ixy = permute(permute(ix) + iy);
            vec4 ixy0 = permute(ixy + iz0);
            vec4 ixy1 = permute(ixy + iz1);

            vec4 gx0 = ixy0 / 7.0;
            vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
            gx0 = fract(gx0);
            vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
            vec4 sz0 = step(gz0, vec4(0.0));
            gx0 -= sz0 * (step(0.0, gx0) - 0.5);
            gy0 -= sz0 * (step(0.0, gy0) - 0.5);

            vec4 gx1 = ixy1 / 7.0;
            vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
            gx1 = fract(gx1);
            vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
            vec4 sz1 = step(gz1, vec4(0.0));
            gx1 -= sz1 * (step(0.0, gx1) - 0.5);
            gy1 -= sz1 * (step(0.0, gy1) - 0.5);

            vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
            vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
            vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
            vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
            vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
            vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
            vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
            vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

            vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
            g000 *= norm0.x;
            g010 *= norm0.y;
            g100 *= norm0.z;
            g110 *= norm0.w;
            vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
            g001 *= norm1.x;
            g011 *= norm1.y;
            g101 *= norm1.z;
            g111 *= norm1.w;

            float n000 = dot(g000, Pf0);
            float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
            float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
            float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
            float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
            float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
            float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
            float n111 = dot(g111, Pf1);

            vec3 fade_xyz = fade(Pf0);
            vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
            vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
            float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
            return 2.2 * n_xyz;
        }

        void main() {

            vec3 rgbColor = texture2D(map, vUv).rgb;
            
            float noise = cnoise(vPosition * 30.0);
            if (noise < 0.8) {

                noise = 1.0;
            }
            else {

                noise = 0.0;
            }

            noise = 0.9 + noise * 0.1;

            gl_FragColor = vec4(rgbColor.r * noise, rgbColor.g * noise, rgbColor.b * noise, 1.0);
        }
    `
);
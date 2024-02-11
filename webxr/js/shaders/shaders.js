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

export const NoiseShader = new Shader(
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

        vec3 convertRGBtoHSV(vec3 rgbColor) {
            float r = rgbColor[0];
            float g = rgbColor[1];
            float b = rgbColor[2];
            float colorMax = max(max(r,g), b);
            float colorMin = min(min(r,g), b);
            float delta = colorMax - colorMin;
            float h = 0.0;
            float s = 0.0;
            float v = colorMax;
            vec3 hsv = vec3(0.0);
            if (colorMax != 0.0) {
              s = (colorMax - colorMin ) / colorMax;
            }
            if (delta != 0.0) {
                if (r == colorMax) {
                    h = (g - b) / delta;
                } else if (g == colorMax) {        
                    h = 2.0 + (b - r) / delta;
                } else {    
                    h = 4.0 + (r - g) / delta;
                }
                h *= 60.0;
                if (h < 0.0) {
                    h += 360.0;
                }
            }
            hsv[0] = h;
            hsv[1] = s;
            hsv[2] = v;
            return hsv;
        }

        vec3 rgb2hsv(vec3 c)
        {
            vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
            vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

            float d = q.x - min(q.w, q.y);
            float e = 1.0e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }

        vec3 hsv2rgb(vec3 c)
        {
            vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
            vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        void main() {

            vec3 rgbColor = texture2D(map, vUv).rgb;
            vec3 hsvColor = rgb2hsv(rgbColor);
            
            float noise = snoise(vUv * 50.0);
            if (noise < 0.0) {

                noise = 1.0;
            }
            else {

                noise = 0.0;
            }

            noise = 0.8 + noise * 0.2;

            hsvColor.y = hsvColor.y + ((1.0 - noise) / 2.0);
            hsvColor.z = hsvColor.z * noise;
            rgbColor = hsv2rgb(hsvColor);

            gl_FragColor = vec4(rgbColor.r, rgbColor.g, rgbColor.b, 1.0);
        }
    `
);
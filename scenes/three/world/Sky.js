"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sky = void 0;
var THREE = require("three");
var three_csm_1 = require("three-csm");
var Sky = /** @class */ (function (_super) {
    __extends(Sky, _super);
    function Sky(world, camera) {
        var _this = _super.call(this) || this;
        _this.SkyShader = {
            uniforms: {
                luminance: { value: 1 },
                turbidity: { value: 2 },
                rayleigh: { value: 1 },
                mieCoefficient: { value: 0.005 },
                mieDirectionalG: { value: 0.8 },
                sunPosition: { value: new THREE.Vector3() },
                cameraPos: { value: new THREE.Vector3() }
            },
            vertexShader: "\n      uniform vec3 sunPosition;\n      uniform float rayleigh;\n      uniform float turbidity;\n      uniform float mieCoefficient;\n  \n      varying vec3 vWorldPosition;\n      varying vec3 vSunDirection;\n      varying float vSunfade;\n      varying vec3 vBetaR;\n      varying vec3 vBetaM;\n      varying float vSunE;\n  \n      const vec3 up = vec3( 0.0, 1.0, 0.0 );\n  \n      // constants for atmospheric scattering\n      const float e = 2.71828182845904523536028747135266249775724709369995957;\n      const float pi = 3.141592653589793238462643383279502884197169;\n  \n      // wavelength of used primaries, according to preetham\n      const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );\n      // this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:\n      // (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))\n      const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );\n  \n      // mie stuff\n      // K coefficient for the primaries\n      const float v = 4.0;\n      const vec3 K = vec3( 0.686, 0.678, 0.666 );\n      // MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K\n      const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );\n  \n      // earth shadow hack\n      // cutoffAngle = pi / 1.95;\n      const float cutoffAngle = 1.6110731556870734;\n      const float steepness = 1.5;\n      const float EE = 1000.0;\n  \n      float sunIntensity( float zenithAngleCos ) {\n      \tzenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );\n      \treturn EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );\n      }\n  \n      vec3 totalMie( float T ) {\n      \tfloat c = ( 0.2 * T ) * 10E-18;\n      \treturn 0.434 * c * MieConst;\n      }\n  \n      void main() {\n  \n      \tvec4 worldPosition = modelMatrix * vec4( position, 1.0 );\n      \tvWorldPosition = worldPosition.xyz;\n  \n      \tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n  \n      \tvSunDirection = normalize( sunPosition );\n  \n      \tvSunE = sunIntensity( dot( vSunDirection, up ) );\n  \n      \tvSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );\n  \n      \tfloat rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );\n  \n      // extinction (absorbtion + out scattering)\n      // rayleigh coefficients\n      \tvBetaR = totalRayleigh * rayleighCoefficient;\n  \n      // mie coefficients\n      \tvBetaM = totalMie( turbidity ) * mieCoefficient;\n  \n      }\n    ",
            fragmentShader: "\n      varying vec3 vWorldPosition;\n      varying vec3 vSunDirection;\n      varying float vSunfade;\n      varying vec3 vBetaR;\n      varying vec3 vBetaM;\n      varying float vSunE;\n  \n      uniform float luminance;\n      uniform float mieDirectionalG;\n      uniform vec3 cameraPos;\n  \n      // constants for atmospheric scattering\n      const float pi = 3.141592653589793238462643383279502884197169;\n  \n      const float n = 1.0003; // refractive index of air\n      const float N = 2.545E25; // number of molecules per unit volume for air at\n      // 288.15K and 1013mb (sea level -45 celsius)\n  \n      // optical length at zenith for molecules\n      const float rayleighZenithLength = 8.4E3;\n      const float mieZenithLength = 1.25E3;\n      const vec3 up = vec3( 0.0, 1.0, 0.0 );\n      // 66 arc seconds -> degrees, and the cosine of that\n      const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;\n  \n      // 3.0 / ( 16.0 * pi )\n      const float THREE_OVER_SIXTEENPI = 0.05968310365946075;\n      // 1.0 / ( 4.0 * pi )\n      const float ONE_OVER_FOURPI = 0.07957747154594767;\n  \n      float rayleighPhase( float cosTheta ) {\n      \treturn THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );\n      }\n  \n      float hgPhase( float cosTheta, float g ) {\n      \tfloat g2 = pow( g, 2.0 );\n      \tfloat inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );\n      \treturn ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );\n      }\n  \n      // Filmic ToneMapping http://filmicgames.com/archives/75\n      const float A = 0.15;\n      const float B = 0.50;\n      const float C = 0.10;\n      const float D = 0.20;\n      const float E = 0.02;\n      const float F = 0.30;\n  \n      const float whiteScale = 1.0748724675633854; // 1.0 / Uncharted2Tonemap(1000.0)\n  \n      vec3 Uncharted2Tonemap( vec3 x ) {\n      \treturn ( ( x * ( A * x + C * B ) + D * E ) / ( x * ( A * x + B ) + D * F ) ) - E / F;\n      }\n  \n      void main() {\n      // optical length\n      // cutoff angle at 90 to avoid singularity in next formula.\n      \tfloat zenithAngle = acos( max( 0.0, dot( up, normalize( vWorldPosition - cameraPos ) ) ) );\n      \tfloat inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );\n      \tfloat sR = rayleighZenithLength * inverse;\n      \tfloat sM = mieZenithLength * inverse;\n  \n      // combined extinction factor\n      \tvec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );\n  \n      // in scattering\n      \tfloat cosTheta = dot( normalize( vWorldPosition - cameraPos ), vSunDirection );\n  \n      \tfloat rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );\n      \tvec3 betaRTheta = vBetaR * rPhase;\n  \n      \tfloat mPhase = hgPhase( cosTheta, mieDirectionalG );\n      \tvec3 betaMTheta = vBetaM * mPhase;\n  \n      \tvec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );\n      \tLin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );\n  \n      // nightsky\n      \tvec3 direction = normalize( vWorldPosition - cameraPos );\n      \tfloat theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]\n      \tfloat phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]\n      \tvec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );\n      \tvec3 L0 = vec3( 0.1 ) * Fex;\n  \n      // composition + solar disc\n      \tfloat sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );\n      \tL0 += ( vSunE * 19000.0 * Fex ) * sundisk;\n  \n      \tvec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );\n  \n      \t//vec3 curr = Uncharted2Tonemap( ( log2( 2.0 / pow( luminance, 4.0 ) ) ) * texColor );\n        // vec3 color = texColor * whiteScale;\n        vec3 color = texColor * 0.3;\n  \n      \tvec3 retColor = pow( color, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );\n  \n      \tgl_FragColor = vec4( retColor, 1.0 );\n  \n        #if defined( TONE_MAPPING )\n          gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );\n        #endif\n      } "
        };
        _this.updateOrder = 5;
        _this.sunPosition = new THREE.Vector3();
        _this._phi = 50;
        _this._theta = 145;
        _this.maxHemiIntensity = 0.9;
        _this.minHemiIntensity = 0.3;
        _this.world = world;
        _this.camera = camera;
        // Sky material
        _this.skyMaterial = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(_this.SkyShader.uniforms),
            fragmentShader: _this.SkyShader.fragmentShader,
            vertexShader: _this.SkyShader.vertexShader,
            side: THREE.BackSide
        });
        // Mesh
        _this.skyMesh = new THREE.Mesh(new THREE.SphereBufferGeometry(1000, 24, 12), _this.skyMaterial);
        _this.attach(_this.skyMesh);
        // Ambient light
        _this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.0);
        _this.refreshHemiIntensity();
        _this.hemiLight.color.setHSL(0.59, 0.4, 0.6);
        _this.hemiLight.groundColor.setHSL(0.095, 0.2, 0.75);
        _this.hemiLight.position.set(0, 50, 0);
        world.add(_this.hemiLight);
        // CSM
        // New version
        // let splitsCallback = (amount, near, far, target) =>
        // {
        // 	for (let i = amount - 1; i >= 0; i--)
        // 	{
        // 		target.push(Math.pow(1 / 3, i));
        // 	}
        // };
        // Legacy
        var splitsCallback = function (amount, near, far) {
            var arr = [];
            for (var i = amount - 1; i >= 0; i--) {
                arr.push(Math.pow(1 / 4, i));
            }
            return arr;
        };
        _this.csm = new three_csm_1.default({
            fov: 80,
            far: 250,
            lightIntensity: 2.5,
            cascades: 3,
            shadowMapSize: 2048,
            camera: _this.camera,
            parent: _this.world,
            mode: 'custom',
            customSplitsCallback: splitsCallback
        });
        _this.csm.fade = true;
        _this.refreshSunPosition();
        _this.csm.update(camera.matrix);
        return _this;
    }
    Object.defineProperty(Sky.prototype, "theta", {
        set: function (value) {
            this._theta = value;
            this.refreshSunPosition();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Sky.prototype, "phi", {
        set: function (value) {
            this._phi = value;
            this.refreshSunPosition();
            this.refreshHemiIntensity();
        },
        enumerable: false,
        configurable: true
    });
    Sky.prototype.update = function () {
        this.position.copy(this.camera.position);
        this.refreshSunPosition();
        this.csm.update(this.camera.matrix);
        this.csm.lightDirection = new THREE.Vector3(-this.sunPosition.x, -this.sunPosition.y, -this.sunPosition.z).normalize();
    };
    Sky.prototype.refreshSunPosition = function () {
        var sunDistance = 10;
        this.sunPosition.x = sunDistance * Math.sin(this._theta * Math.PI / 180) * Math.cos(this._phi * Math.PI / 180);
        this.sunPosition.y = sunDistance * Math.sin(this._phi * Math.PI / 180);
        this.sunPosition.z = sunDistance * Math.cos(this._theta * Math.PI / 180) * Math.cos(this._phi * Math.PI / 180);
        this.skyMaterial.uniforms.sunPosition.value.copy(this.sunPosition);
        this.skyMaterial.uniforms.cameraPos.value.copy(this.camera.position);
    };
    Sky.prototype.refreshHemiIntensity = function () {
        this.hemiLight.intensity = this.minHemiIntensity + Math.pow(1 - (Math.abs(this._phi - 90) / 90), 0.25) * (this.maxHemiIntensity - this.minHemiIntensity);
    };
    return Sky;
}(THREE.Object3D));
exports.Sky = Sky;
//# sourceMappingURL=sky.js.map
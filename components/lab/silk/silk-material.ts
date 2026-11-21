import { AdditiveBlending, DoubleSide, Vector3, type ShaderMaterialParameters } from "three";

/** Ashima Arts 3D simplex noise (MIT), the standard GLSL implementation. */
const SIMPLEX = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}`;

const vertexShader = /* glsl */ `
${SIMPLEX}
uniform vec3 uP0; uniform vec3 uP1; uniform vec3 uP2; uniform vec3 uP3;
uniform float uWidth; uniform float uTwist; uniform float uNoise; uniform float uSeed; uniform float uTime;
uniform vec3 uMouse; uniform float uMouseStrength; uniform float uStretch;
varying float vU; varying float vV; varying float vFacing; varying vec3 vWorld;

vec3 bezier(float u) {
  float v = 1.0 - u;
  return v * v * v * uP0 + 3.0 * v * v * u * uP1 + 3.0 * v * u * u * uP2 + u * u * u * uP3;
}
vec3 bezierTangent(float u) {
  float v = 1.0 - u;
  return normalize(3.0 * v * v * (uP1 - uP0) + 6.0 * v * u * (uP2 - uP1) + 3.0 * u * u * (uP3 - uP2));
}

void main() {
  float u = position.x + 0.5;
  float v = position.y * 2.0;
  // Scroll speed stretches the ribbon along its own length.
  float uu = clamp(0.5 + (u - 0.5) * (1.0 + uStretch * 0.35), 0.0, 1.0);
  vec3 center = bezier(uu);
  vec3 tangent = bezierTangent(uu);
  float t = uTime * (0.11 + uStretch * 0.25);
  center.y += snoise(vec3(uu * 1.7 + uSeed, t, uSeed * 3.1)) * uNoise;
  center.z += snoise(vec3(uu * 1.3 - uSeed, t * 0.8, uSeed * 1.7)) * uNoise * 0.9;

  // Silk bends towards the cursor (spring-smoothed on the CPU).
  vec2 toMouse = uMouse.xy - center.xy;
  float pull = exp(-dot(toMouse, toMouse) / 2.6) * uMouseStrength;
  center.xy += toMouse * pull * 0.32;
  center.z += pull * 0.45;

  // The sheet twists around its own path: folds seen edge-on become bright silk edges.
  vec3 side = normalize(vec3(-tangent.y, tangent.x, 0.0));
  float angle = uTwist * uu + snoise(vec3(uu * 1.1 + uSeed, t * 0.7, 2.0)) * 1.5;
  vec3 across = side * cos(angle) + vec3(0.0, 0.0, 1.0) * sin(angle);
  float taper = pow(max(sin(3.14159265 * uu), 0.0), 0.55);
  vec3 world = center + across * v * uWidth * 0.5 * taper;

  vU = u; vV = v; vFacing = abs(cos(angle)); vWorld = world;
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}`;

const fragmentShader = /* glsl */ `
uniform float uIntensity; uniform float uTime; uniform float uSeed; uniform float uSoft;
uniform vec3 uMouse; uniform float uCursorGlow; uniform float uReveal; uniform float uFakeGlow;
varying float vU; varying float vV; varying float vFacing; varying vec3 vWorld;

void main() {
  float v2 = vV * vV;
  // Intense white core dissolving into a soft grey sheet; far ribbons are softer (fake depth blur).
  float core = exp(-v2 * mix(90.0, 18.0, uSoft));
  float sheet = (1.0 - v2) * mix(0.035, 0.07, uSoft);
  float edge = pow(1.0 - vFacing, 3.0) * (1.0 - v2) * 0.5;
  float glow = exp(-v2 * 4.0) * 0.3 * uFakeGlow;
  // Pearly variation, strictly in greys.
  float pearl = 0.86 + 0.14 * sin(vU * 38.0 + vV * 2.5 - uTime * 0.5 + uSeed * 6.0);
  float ends = smoothstep(0.0, 0.14, vU) * smoothstep(1.0, 0.86, vU);
  // Opening: the ribbon grows from the centre of the loader line towards both ends.
  float reveal = 1.0 - smoothstep(uReveal - 0.18, uReveal, abs(vU - 0.5) * 2.0);
  float cursor = exp(-dot(vWorld.xy - uMouse.xy, vWorld.xy - uMouse.xy) * 0.9) * uCursorGlow;
  float light = (core * 1.1 + sheet + edge + glow) * pearl * (1.0 + cursor) * ends * reveal * uIntensity;
  gl_FragColor = vec4(vec3(light), 1.0);
}`;

/** Parameters for one ribbon material; the scene declares it in JSX and drives its uniforms per frame. */
export function silkMaterialParameters(seed: number, soft: number, fakeGlow: boolean): ShaderMaterialParameters {
  return {
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    toneMapped: false,
    uniforms: {
      uP0: { value: new Vector3() }, uP1: { value: new Vector3() }, uP2: { value: new Vector3() }, uP3: { value: new Vector3() },
      uWidth: { value: 1 }, uTwist: { value: 2 }, uNoise: { value: .3 }, uSeed: { value: seed }, uTime: { value: 0 },
      uMouse: { value: new Vector3(99, 99, 0) }, uMouseStrength: { value: 0 }, uStretch: { value: 0 },
      uIntensity: { value: 1 }, uSoft: { value: soft }, uCursorGlow: { value: 0 }, uReveal: { value: 1.2 }, uFakeGlow: { value: fakeGlow ? 1 : 0 },
    },
  };
}

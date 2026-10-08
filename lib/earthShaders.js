// GLSL shaders for the Earth globe and its atmosphere halo.

export const earthVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  }
`;

export const earthFragment = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D cloudMap;
  uniform vec3 sunDir;
  uniform float time;

  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = vec3(0.0, 0.0, 1.0);

    vec3 col = texture2D(dayMap, vUv).rgb;
    float cloud = texture2D(cloudMap, vUv + vec2(time * 0.0015, 0.0)).a;
    col = mix(col, vec3(0.97, 0.98, 1.0), cloud * 0.8);

    // Soft sunlight
    float d = dot(n, sunDir);
    col *= mix(0.35, 1.25, smoothstep(-0.3, 0.7, d));

    // Lift oceans toward a brighter blue
    col = mix(col, vec3(0.18, 0.36, 0.62), 0.18);

    // Pale blue atmospheric haze toward the horizon
    float f = pow(1.0 - max(dot(n, v), 0.0), 2.6);
    col = mix(col, vec3(0.80, 0.89, 0.97), f * 0.9);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;

  void main() {
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragment = /* glsl */ `
  varying vec3 vNormal;

  void main() {
    float k = clamp(-dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
    float a = pow(smoothstep(0.0, 0.45, k), 1.6);
    gl_FragColor = vec4(0.96, 0.98, 1.0, a * 0.95);
  }
`;

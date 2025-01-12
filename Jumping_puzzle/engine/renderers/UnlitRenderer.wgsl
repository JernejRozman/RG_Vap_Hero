struct VertexInput {
    @location(0) position: vec3f,
    @location(1) texcoords: vec2f,
    @location(2) normal: vec3f,
}

struct VertexOutput {
    @builtin(position) clipPosition: vec4f,
    @location(0) position: vec3f,
    @location(1) texcoords: vec2f,
    @location(2) normal: vec3f,
}

struct FragmentInput {
    @location(0) position: vec3f,
    @location(1) texcoords: vec2f,
    @location(2) normal: vec3f,
}

struct FragmentOutput {
    @location(0) color: vec4f,
}

struct CameraUniforms {
    viewMatrix: mat4x4f,
    projectionMatrix: mat4x4f,
    position: vec3f, // Add camera position
    _padding: f32,   // Padding to align the structure
}

struct ModelUniforms {
    modelMatrix: mat4x4f,
    normalMatrix: mat3x3f,
}

struct MaterialUniforms {
    baseFactor: vec4f,
}

struct LightUniforms {
    position: vec3f,
    color: vec3f,
    ambient: vec3f,
    smer_luci: vec3f,
    sirina_svetlobnega_snopa: f32,
    faktor_usmerjenosti: f32,
};

@group(0) @binding(0) var<uniform> camera: CameraUniforms;

@group(1) @binding(0) var<uniform> model: ModelUniforms;

@group(2) @binding(0) var<uniform> material: MaterialUniforms;
@group(2) @binding(1) var baseTexture: texture_2d<f32>;
@group(2) @binding(2) var baseSampler: sampler;

@group(3) @binding(0) var<uniform> light: LightUniforms;

@vertex
fn vertex(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    // Rezalne koordinate v clip space
    output.clipPosition = camera.projectionMatrix * camera.viewMatrix * model.modelMatrix * vec4(input.position, 1);
    
    // Pozicija vsakega fragmenta v svetovnem koordinatnem sistemu
    output.position = (model.modelMatrix * vec4(input.position, 1)).xyz;
    output.texcoords = input.texcoords;
    output.normal = model.normalMatrix * input.normal;

    return output;
}

@fragment
fn fragment(input: FragmentInput) -> FragmentOutput {
    var output: FragmentOutput;

    // Normaliziraj normalni vektor
    let N = normalize(input.normal);

    // Izračunaj vektor svetlobe
    let L = normalize(input.position - light.position);

    // Izračunaj vektor pogleda
    let V = normalize(camera.position - input.position);

    // Izračunaj vektor na pol poti
    let H = normalize(L + V);

    // Izračunaj Lambertov odboj (difuzna osvetlitev)
    let lambert = max(dot(N, L), 0);

    // Izračunaj Blinn-Phongov spekularni odboj
    let blinn = pow(max(dot(N, H), 0), light.faktor_usmerjenosti);

    // Izračunaj učinek reflektorske luči glede na kot odrezovanja in smer
    let spotlightEffect = smoothstep(light.sirina_svetlobnega_snopa, 1.0, dot(L, normalize(light.smer_luci)));

    // Vzemi barvo materiala iz teksture
    let materialColor = textureSample(baseTexture, baseSampler, input.texcoords) * material.baseFactor;

    // Združi difuzno, spekularno in ambientalno komponento osvetlitve
    output.color = materialColor * vec4f(light.color * (lambert + blinn) * spotlightEffect + light.ambient, 1.0);

    return output;
}
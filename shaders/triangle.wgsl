struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) color: vec3<f32>,
    @location(2) texcoord: vec2<f32>,
};

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) texcoord: vec2<f32>,
};

struct UniformData {
    offset: vec3<f32>,
}

@group(0) @binding(0)
var<uniform> uData: UniformData;

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
    var out: VertexOutput;
    out.position = vec4<f32>(input.position + uData.offset, 1.0);
    out.color = vec4<f32>(input.color, 1.0);
    out.texcoord = input.texcoord;
    return out;
}

@group(0) @binding(1)
var diffuseTexture: texture_2d<f32>;

@group(0) @binding(2)
var diffuseSampler: sampler;

@fragment
fn fs_main(in : VertexOutput) -> @location(0) vec4<f32> {
    return textureSample(diffuseTexture, diffuseSampler, in.texcoord) * in.color;
}

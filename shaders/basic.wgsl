struct VertexInput {
    @location(0) a_pos: vec3<f32>,
    @location(1) a_norm: vec3<f32>,
    @location(2) a_texcoord: vec2<f32>,
};

struct VertexOutput {
    @builtin(position) v_pos: vec4<f32>,
    @location(0) v_norm: vec3<f32>,
    @location(1) v_texcoord: vec2<f32>,
};

@group(0) @binding(0)
var<uniform> u_pvm: mat4x4<f32>;

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    output.v_pos = u_pvm * vec4<f32>(input.a_pos, 1.0);
    output.v_norm = input.a_norm;
    output.v_texcoord = input.a_texcoord;
    return output;
}

@group(0) @binding(1)
var u_diffuse_texture: texture_2d<f32>;

@group(0) @binding(2)
var u_diffuse_sampler: sampler;

@group(0) @binding(3)
var<uniform> u_texcoord_multiplier: vec2<f32>;

struct FragmentOut {
    @location(0) color: vec4<f32>,
};

@fragment
fn fs_main(input: VertexOutput) -> FragmentOut {
    var out: FragmentOut;
    out.color = textureSample(u_diffuse_texture, u_diffuse_sampler, u_texcoord_multiplier * input.v_texcoord);
    return out;
}

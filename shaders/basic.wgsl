struct VertexInput {
    @location(0) a_pos: vec3<f32>,
    @location(1) a_color: vec3<f32>,
};

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) v_color: vec3<f32>,
};

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    output.clip_position = vec4<f32>(input.a_pos, 1.0);
    output.v_color = input.a_color;
    return output;
}

struct FragmentOut {
    @location(0) color: vec4<f32>,
};

@fragment
fn fs_main(input: VertexOutput) -> FragmentOut {
    var out: FragmentOut;
    out.color = vec4<f32>(input.v_color, 1.0);
    return out;
}

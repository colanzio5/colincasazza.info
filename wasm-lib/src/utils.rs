use std::ops::{MulAssign, Neg};

use nalgebra::{clamp, Vector3};
use wasm_bindgen::prelude::*;

pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);

    // The `console.log` is quite polymorphic, so we can bind it with multiple
    // signatures. Note that we need to use `js_name` to ensure we always call
    // `log` in JS.
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    pub fn log_u32(a: u32);

    // Multiple arguments too!
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    pub fn log_many(a: &str, b: &str);
}

pub fn clamp_magnitude(vector: &mut Vector3<f32>, max: f32) {
    vector.x = vector.x.clamp(-max, max);
    vector.y = vector.y.clamp(-max, max);
    vector.z = vector.z.clamp(-max, max);
}

// pub fn clamp_magnitude(vector: &mut Vector3<f32>, max: f32) {
//     let norm_squared = vector.norm_squared();
//     if norm_squared > (max * max) {
//         let mag = norm_squared;
//         //these intermediate variables force the intermediate result to be
//         //of float precision. without this, the intermediate result can be of higher
//         //precision, which changes behavior.
//         vector.x = (vector.x / mag) * max;
//         vector.y = (vector.y / mag) * max;
//         vector.z = (vector.z / mag) * max;
//     }
// }

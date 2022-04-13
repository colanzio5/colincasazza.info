use std::string;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Clone)]
pub struct BirdConfig {
    pub neighbor_distance: f32,
    pub separation_multiplier: f32,
    pub alignment_multiplier: f32,
    pub cohesion_multiplier: f32,
    pub max_speed: f32,
    pub max_force: f32,
    pub bird_size: f32,
    pub color_r: f32,
    pub color_g: f32,
    pub color_b: f32,
}

#[wasm_bindgen]
impl BirdConfig {
    pub fn new(
        neighbor_distance: f32,
        separation_multiplier: f32,
        alignment_multiplier: f32,
        cohesion_multiplier: f32,
        max_speed: f32,
        max_force: f32,
        bird_size: f32,
        color_r: f32,
        color_g: f32,
        color_b: f32,
    ) -> BirdConfig {
        BirdConfig {
            neighbor_distance,
            separation_multiplier,
            alignment_multiplier,
            cohesion_multiplier,
            max_speed,
            max_force,
            bird_size,
            color_r,
            color_g,
            color_b,
        }
    }
}
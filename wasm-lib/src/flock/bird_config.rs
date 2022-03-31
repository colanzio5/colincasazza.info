use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Copy, Clone)]
pub struct BirdConfig {
    pub neighbor_distance: f32,
    pub desired_separation: f32,
    pub separation_multiplier: f32,
    pub alignment_multiplier: f32,
    pub cohesion_multiplier: f32,
    pub max_speed: f32,
    pub max_force: f32,
    pub bird_size: f32,
}

#[wasm_bindgen]
impl BirdConfig {
    pub fn new(
        neighbor_distance: f32,
        desired_separation: f32,
        separation_multiplier: f32,
        alignment_multiplier: f32,
        cohesion_multiplier: f32,
        max_speed: f32,
        max_force: f32,
        bird_size: f32,
    ) -> BirdConfig {
        BirdConfig {
            neighbor_distance,
            desired_separation,
            separation_multiplier,
            alignment_multiplier,
            cohesion_multiplier,
            max_speed,
            max_force,
            bird_size,
        }
    }
}

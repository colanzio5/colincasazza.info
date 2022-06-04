use nalgebra::Vector2;
use ordered_float::OrderedFloat;
use wasm_bindgen::{prelude::*, throw_str};

use std::collections::HashMap;

use crate::utils::log;

use super::{bird::Bird, bird_config::BirdConfig};

// const GLOBAL_MAX_FLOCK_SIZE: usize = 2500;
// const GLOBAL_VERTICES_PER_BIRD: usize = 4;
// const GLOBAL_VERTEX_BUFFER_SIZE: usize = GLOBAL_MAX_FLOCK_SIZE * GLOBAL_VERTICES_PER_BIRD * 3;

#[wasm_bindgen]
pub struct Flock {
    birds: kd_tree::KdTree2<Bird>,
    configs: HashMap<String, BirdConfig>,
    rng: oorandom::Rand32,
    max_flock_size: usize,
}

#[wasm_bindgen]
impl Flock {
    pub fn add_bird(&mut self, config_id: String, pos_x: f32, pos_y: f32) {
        // check the config exists
        if !self.configs.contains_key(&config_id) {
            let err = format!(
                "cannot add bird to flock. config with id {} was not found in bird config hashmap",
                config_id
            );
            log(&err);
            throw_str(&err);
        }
        let position = Vector2::new(pos_x, pos_y);
        let velocity = Vector2::new(-self.rng.rand_float(), self.rng.rand_float());
        let acceleration = Vector2::new(-self.rng.rand_float(), self.rng.rand_float());
        // add bird to flock
        let mut new_birds = self.birds.to_vec();
        new_birds.push(Bird {
            position,
            velocity,
            acceleration,
            config_id,
        });

        let num_birds = self.birds.len();
        // if oversized remove one from front of the vector
        if num_birds > usize::from(self.max_flock_size) {
            let idx = self.rng.rand_range(0..self.birds.len() as u32);
            new_birds.remove(idx as usize);
        }
        // rebuild tree
        self.birds = kd_tree::KdTree2::build_by_key(new_birds, |bird, k| {
            ordered_float::OrderedFloat(bird.position[k])
        });
    }

    pub fn add_bird_at_random_position(&mut self, config_id: String, width: f32, height: f32) {
        // generate some random params for bird
        let half_width = width / 2f32;
        let half_height = height / 2f32;
        let x = (self.rng.rand_float() * width) - half_width;
        let y = (self.rng.rand_float() * height) - half_height;
        self.add_bird(config_id, x, y);
    }

    pub fn add_bird_config(&mut self, config_id: String, bird_config: BirdConfig) {
        self.configs.insert(config_id, bird_config);
    }

    pub fn get_current_flock_size(&self) -> usize {
        self.birds.len()
    }

    pub fn new(max_flock_size: usize, seed: u64) -> Flock {
        Flock {
            max_flock_size,
            configs: HashMap::new(),
            birds: kd_tree::KdTree2::build_by_ordered_float(Vec::new()),
            rng: oorandom::Rand32::new(seed),
        }
    }

    pub fn remove_bird_config(&mut self, config_id: String) {
        let new_birds = self
            .birds
            .to_vec()
            .iter()
            .filter(|b| b.config_id != config_id)
            .cloned()
            .collect();

        self.birds = kd_tree::KdTree2::build_by_key(new_birds, |bird, k| {
            ordered_float::OrderedFloat(bird.position[k])
        });
        self.configs.remove(&config_id);
    }

    pub fn set_max_flock_size(&mut self, max_flock_size: usize) {
        // if too many birds, remove randomly untill in size
        if max_flock_size < self.birds.len() {
            let mut new_birds = self.birds.to_vec();
            log(&format!("cur: {}, new: {}, num to remove: {} ", self.birds.len(), max_flock_size, new_birds.len() - max_flock_size));
            for _ in 0..new_birds.len() - max_flock_size {
                let idx = self.rng.rand_range(0..(new_birds.len()) as u32);
                new_birds.remove(idx as usize);
            }
            self.birds = kd_tree::KdTree2::build_by_key(new_birds, |bird, k| {
                ordered_float::OrderedFloat(bird.position[k])
            });
        }
        self.max_flock_size = max_flock_size;
    }

    // we could also pass a js closure that updates vertex buffer
    // todo: compare [but wasm **should** win]
    // js closure passed in should update
    // the flocks entity geometry
    // given the vertices passed.
    pub fn update(
        &mut self,
        width: f32,
        height: f32,
        time_step: f32,
        update_flock_geometry: &js_sys::Function,
    ) {
        // for collecting vertices and colors
        let mut vertices: Vec<f32> = Vec::new();
        let mut colors: Vec<f32> = Vec::new();

        // we need to store the current state of the flock
        // (just position for each bird)
        let new_flock: Vec<Bird> = self
            .birds
            .clone()
            .to_vec()
            .iter_mut()
            .map(|bird| {
                let bird_config = self.configs.get(&bird.config_id).unwrap();
                bird.update_bird(&self.birds, bird_config, &width, &height, &time_step);
                for vertex in bird.get_vertices(bird_config) {
                    vertices.push(vertex.x);
                    vertices.push(vertex.y);
                    vertices.push(0.);
                    colors.push(bird_config.color_r);
                    colors.push(bird_config.color_g);
                    colors.push(bird_config.color_b);
                }
                bird.to_owned()
            })
            .collect();

        let js_vertices = js_sys::Float32Array::from(vertices.as_slice());
        let js_colors = js_sys::Float32Array::from(colors.as_slice());
        let e = update_flock_geometry.call2(&JsValue::null(), &js_vertices, &js_colors);
        if e.is_err() {
            log("could not call js update vertex buffer function from rust");
        }
        // rebuild tree
        self.birds =
            kd_tree::KdTree2::build_by_key(new_flock, |bird, k| OrderedFloat(bird.position[k]));
    }

    pub fn update_bird_config(&mut self, config_id: String, updated_bird_config: BirdConfig) {
        self.configs.remove(&config_id).unwrap_or_else(|| {
            let err = format!(
                "cannot update bird config, existing config with id {} does not exist.",
                config_id
            );
            throw_str(&err);
        });

        self.add_bird_config(config_id, updated_bird_config);
    }
}

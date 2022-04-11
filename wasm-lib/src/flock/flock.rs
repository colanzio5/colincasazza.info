use js_sys::Array;
use nalgebra::Vector3;
use ordered_float::OrderedFloat;
use wasm_bindgen::{convert::FromWasmAbi, prelude::*};

use std::{
    collections::{HashMap, VecDeque},
    fmt::Result,
};

use super::{bird::Bird, bird_config::{BirdConfig, self}};
use crate::utils::log;

// const GLOBAL_MAX_FLOCK_SIZE: usize = 2500;
// const GLOBAL_VERTICES_PER_BIRD: usize = 4;
// const GLOBAL_VERTEX_BUFFER_SIZE: usize = GLOBAL_MAX_FLOCK_SIZE * GLOBAL_VERTICES_PER_BIRD * 3;

#[wasm_bindgen]
pub struct Flock {
    birds: kd_tree::KdTree2<Bird>,
    max_flock_size: usize,
    configs: HashMap<String, BirdConfig>,
}

#[wasm_bindgen]
impl Flock {
    pub fn new(max_flock_size: usize) -> Flock {
        Flock {
            max_flock_size,
            configs: HashMap::new(),
            birds: kd_tree::KdTree2::build_by_ordered_float(Vec::new()),
        }
    }

    // we could also pass a js closure that updates vertex buffer
    // todo: compare [but wasm **should** win]
    // js closure passed in should update
    // the flocks entity geometry
    // given the vertices passed.
    pub fn update(&mut self, width: f32, height: f32, update_flock_geometry: &js_sys::Function) {
        // we need to store the current state of the flock
        // (just position for each bird)
        let new_flock: Vec<Bird> = self
            .birds
            .clone()
            .to_vec()
            .iter_mut()
            .map(|bird| {
                let bird_config = self.configs.get(&bird.config_id).unwrap();
                bird.update_bird(&self.birds, bird_config, &width, &height, &0.3f32);
                bird.clone()
            })
            .collect();

        // rebuild tree
        self.birds =
            kd_tree::KdTree2::build_by_key(new_flock, |bird, k| OrderedFloat(bird.position[k]));

        // collect vertices and colors
        let mut vertices: Vec<f32> = Vec::new();
        let mut colors: Vec<f32> = Vec::new();

        for bird in self.birds.iter() {
            let bird_config = self.configs.get(&bird.config_id).unwrap();
            for vertex in bird.get_vertices(bird_config) {
                vertices.push(vertex.x);
                vertices.push(vertex.y);
                vertices.push(vertex.z);
                colors.push(bird_config.color_r);
                colors.push(bird_config.color_g);
                colors.push(bird_config.color_b);
            }
        }

        let js_vertices = js_sys::Float32Array::from(vertices.as_slice());
        let js_colors = js_sys::Float32Array::from(colors.as_slice());
        let e = update_flock_geometry.call2(&JsValue::null(), &js_vertices, &js_colors);
        if e.is_err() {
            log("could not call js update vertex buffer function from rust");
        }
    }

    pub fn add_bird_config(&mut self, config_id: String, bird_config: BirdConfig) {
        self.configs.insert(config_id, bird_config);
    }

    pub fn remove_bird_config(&mut self, config_id: String) {
        self.configs.remove(&config_id);
    }

    pub fn add_bird(
        &mut self,
        entity_pos_x: f32,
        entity_pos_y: f32,
        vel_x: f32,
        vel_y: f32,
        acc_x: f32,
        acc_y: f32,
        config_id: String,
    ) {
        // check the config exists
        if !self.configs.contains_key(&config_id) {
            let err = format!(
                "cannot add bird to flock. config with id {} was not found in bird config hashmap",
                config_id
            );
            log(&err);
            return;
        }
        let position = Vector3::new(entity_pos_x, entity_pos_y, 0.);
        let velocity = Vector3::new(vel_x, vel_y, 0.);
        let acceleration = Vector3::new(acc_x, acc_y, 0.);
        let new_bird = Bird {
            config_id,
            position,
            velocity,
            acceleration,
        };
        // add bird to flock
        let mut new_birds = self.birds.to_vec();
        new_birds.push(new_bird);
        // if oversized remove one from front of the vector
        if self.birds.len() > usize::from(self.max_flock_size) {
            new_birds = new_birds[1..new_birds.len()].to_vec();
        }
        // rebuild tree
        self.birds = kd_tree::KdTree2::build_by_key(new_birds, |bird, k| {
            ordered_float::OrderedFloat(bird.position[k])
        });
    }
}

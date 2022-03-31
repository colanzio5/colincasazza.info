use glam::{Vec3};
use js_sys::Array;
use wasm_bindgen::{convert::FromWasmAbi, prelude::*};

use std::{
    array,
    collections::{HashMap, VecDeque},
    iter::FromIterator,
    slice,
};

use super::{bird::Bird, bird_config::BirdConfig};
use crate::utils::log;
use arrayvec::ArrayVec;

const GLOBAL_MAX_FLOCK_SIZE: usize = 2500;

#[wasm_bindgen]
pub struct Flock {
    birds: ArrayVec<Bird, GLOBAL_MAX_FLOCK_SIZE>,
    flock_vertex_buffer: [f32; GLOBAL_MAX_FLOCK_SIZE * 3],
    configs: HashMap<String, BirdConfig>,
    max_flock_size: usize,
}

#[wasm_bindgen]
impl Flock {
    pub fn new(max_flock_size: usize) -> Flock {
        let birds = ArrayVec::<Bird, GLOBAL_MAX_FLOCK_SIZE>::new();
        let flock_vertex_buffer: [f32; GLOBAL_MAX_FLOCK_SIZE * 3] = [0.; GLOBAL_MAX_FLOCK_SIZE * 3];
        let configs = HashMap::new();
        Flock {
            birds,
            configs,
            max_flock_size,
            flock_vertex_buffer
        }
    }

    pub fn update(&mut self, width: f32, height: f32, update_flock_vertices: &js_sys::Function) {
        let current_birds = self.birds.clone();
        let current_vertices: Vec<Vec3> = current_birds
            .iter()
            .map(|bird| Vec3::new(bird.position.x, bird.position.y, 0.))
            .collect();
        for (index, bird) in self.birds.iter_mut().enumerate() {
            let bird_config = self.configs.get(&bird.config_id).unwrap();
            bird.update_bird(&current_vertices, &bird_config, &width, &height);
            self.flock_vertex_buffer[(index * 3)] = bird.position.x;
            self.flock_vertex_buffer[(index * 3) + 1] = bird.position.y;
            self.flock_vertex_buffer[(index * 3) + 2] = 0.;
        }
        // js closure passed in should update
        // the flocks entity geometry
        // given the vertices passed. 
        let this = JsValue::null();
        let js_vertices = js_sys::Float32Array::from(&self.flock_vertex_buffer[..]);
        let r = update_flock_vertices.call1(&this, &js_vertices);
    }

    pub fn add_bird_config(&mut self, config_id: String, bird_config: BirdConfig) {
        self.configs.insert(config_id, bird_config);
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
        let position = Vec3::new(entity_pos_x, entity_pos_y, 0.);
        let velocity = Vec3::new(vel_x, vel_y, 0.);
        let acceleration = Vec3::new(acc_x, acc_y, 0.);
        // add bird to the end of vector
        self.birds.push(Bird {
            config_id,
            position,
            velocity,
            acceleration,
        });
        // if oversized remove one from front of the vector
        if self.birds.len() > usize::from(self.max_flock_size) {
            self.birds.pop_at(0);
        }
    }

    pub fn get_flock_vertices(&self) -> Vec<f32> {
        let mut flock_vertices = Vec::new();
        for bird in self.birds.iter() {
            let bird_config = self.configs.get(&bird.config_id).unwrap();
            let bird_vertices = bird.get_vertices(bird_config);
            flock_vertices = [flock_vertices, bird_vertices].concat();
        }
        flock_vertices
    }
}

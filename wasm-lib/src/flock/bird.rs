use core::num;
use kd_tree::{KdPoint, KdTree2};
use nalgebra::{Matrix3, Vector3};
use ordered_float::Float;
use std::{f32::consts::PI, ops::Mul};

use crate::utils::{clamp_magnitude, nearly_equal};

use super::bird_config::BirdConfig;

#[derive(Clone)]
pub struct Bird {
    pub position: Vector3<f32>,
    pub velocity: Vector3<f32>,
    pub acceleration: Vector3<f32>,
    pub config_id: String,
}

// implement `kdpoint` for your item type.
impl KdPoint for Bird {
    type Scalar = f32;
    type Dim = typenum::U2; // 2 dimensional tree.
    fn at(&self, k: usize) -> f32 {
        self.position[k]
    }
}

impl Bird {
    pub fn update_bird(
        &mut self,
        birds: &KdTree2<Bird>,
        bird_config: &BirdConfig,
        width: &f32,
        height: &f32,
        time_step: &f32,
    ) {
        self.borders(bird_config, width, height);
        self.acceleration += self.apply_flock_forces(birds, bird_config);
        // clamp_magnitude(&mut self.acceleration, bird_config.max_force);
        self.velocity += 0.5 * (self.acceleration * (time_step * time_step));
        clamp_magnitude(&mut self.velocity, bird_config.max_speed);
        self.position += *time_step * self.velocity;
        // reset accelertion to 0 each cycle
        self.acceleration = Vector3::new(0., 0., 0.);
    }

    // wrap when going offscreen
    fn borders(&mut self, bird_config: &BirdConfig, width: &f32, height: &f32) {
        let half_width = width / 2.;
        let half_height = height / 2.;
        let r = bird_config.bird_size * 1.5;
        if self.position.x + r < -half_width {
            self.position.x = half_width - r;
        }
        if self.position.y + r < -half_height {
            self.position.y = half_height - r;
        }
        if self.position.x + r > half_width + r {
            self.position.x = -half_width + r;
        }
        if self.position.y + r > half_height + r {
            self.position.y = -half_height + r;
        }
    }

    fn apply_flock_forces(&self, birds: &KdTree2<Bird>, bird_config: &BirdConfig) -> Vector3<f32> {
        let other_birds = birds.within_radius(self, bird_config.neighbor_distance);
        let num_other_birds = other_birds.len() as f32;

        let mut sep = Vector3::new(0., 0., 0.); // start with empty vector to accumulate all positions
        let mut ali = Vector3::new(0., 0., 0.); // start with empty vector to accumulate all positions
        let mut coh = Vector3::new(0., 0., 0.); // start with empty vector to accumulate all positions
        other_birds.iter().for_each(|other_bird| {
            let diff = other_bird.position - self.position;
            if !nearly_equal(diff.magnitude(), 0.0, 0.01) {
                sep += diff;
                ali += other_bird.velocity;
                coh += other_bird.position;
            }
        });

        if num_other_birds.is_normal() {
            sep /= num_other_birds;
            ali.normalize_mut();
            ali *= num_other_birds;
            ali *= bird_config.max_speed;
            clamp_magnitude(&mut ali, bird_config.max_force);
            coh /= num_other_birds;
        }

        if nearly_equal(sep.magnitude(), 0.0, 0.001) {
            sep.normalize_mut();
            sep *= bird_config.max_speed;
            sep -= self.velocity;
            clamp_magnitude(&mut sep, bird_config.max_force);
        }

        let f_net = Vector3::new(0., 0., 0.)
            // + (sep * bird_config.separation_multiplier);
            + (ali * bird_config.alignment_multiplier);
            // + (coh * bird_config.alignment_multiplier);

        crate::utils::log(&f_net.to_string());
        f_net
    }

    // return equilateral triangle centered around self.pos
    // with side lengths of bird_size,
    pub fn get_vertices(&self, bird_config: &BirdConfig) -> Vec<Vector3<f32>> {
        let angle = self.velocity.angle(&Vector3::new(0., 1., 0.));
        // todo: make into homogenous matrix
        let rot_matrix = Matrix3::from_columns(&[
            Vector3::new(angle.cos(), angle.sin(), 0.),
            Vector3::new(-angle.sin(), angle.cos(), 0.),
            Vector3::new(0., 0., 1.),
        ]);
        // triangle vertices
        let q = bird_config.bird_size / (2. * (PI / 6.).cos());
        let r = (PI / 6.).tan() * (bird_config.bird_size / 2.);
        // array of pairs of triangles' vertices
        [
            Vector3::new(0., q * 2., 0.),
            Vector3::new(-bird_config.bird_size / 2., -r, 0.),
            Vector3::new(bird_config.bird_size / 2., -r, 0.),
            Vector3::new(0., q * 2., 0.),
        ]
        // rotate and translate
        .map(|e| rot_matrix * e)
        .map(|e| e + self.position)
        .to_vec()
    }
}

use std::{
    collections::VecDeque,
    f32::consts::PI,
    ops::{Add, AddAssign, DivAssign, Mul, MulAssign, Neg, Sub, SubAssign},
};

// use crate::utils::log;

// use glam::{Mat2, Mat3, Vector3, Vec2};
use kd_tree::KdPoint;
use nalgebra::{DimMul, Matrix3, RealField, Vector3};

use crate::utils::log;

use super::bird_config::BirdConfig;

#[derive(Clone)]
pub struct Bird {
    pub position: Vector3<f32>,
    pub velocity: Vector3<f32>,
    pub acceleration: Vector3<f32>,
    pub config_id: String,
}

// implement `KdPoint` for your item type.
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
        birds: &Vec<Vector3<f32>>,
        bird_config: &BirdConfig,
        width: &f32,
        height: &f32,
    ) {
        self.borders(bird_config, height, width);
        self.apply_flock_forces(birds, bird_config);
        self.update_physics(bird_config);
    }

    // we accumulate a new acceleration each time based on three rules
    fn apply_flock_forces(&mut self, birds: &Vec<Vector3<f32>>, bird_config: &BirdConfig) {
        let mut sep = self.separate(&birds, bird_config); // separation
        let mut ali = self.align(&birds, bird_config); // alignment
        let mut coh = self.cohesion(&birds, bird_config); // cohesion
                                                          // weight from bird "species"
        sep.mul_assign(bird_config.separation_multiplier);
        ali.mul_assign(bird_config.alignment_multiplier);
        coh.mul_assign(bird_config.cohesion_multiplier);
        // add the force vectors to acceleration
        self.acceleration.add_assign(sep);
        self.acceleration.add_assign(ali);
        self.acceleration.add_assign(coh);
    }

    // method to update location
    fn update_physics(&mut self, bird_config: &BirdConfig) {
        // update velocity
        self.velocity.add_assign(self.acceleration);
        // limit speed
        let clamp_speed = Vector3::new(
            bird_config.max_speed,
            bird_config.max_speed,
            bird_config.max_speed,
        );
        self.velocity
            .xyz()
            .map(|num| num.clamp(-bird_config.max_speed, bird_config.max_speed));

        self.position.add_assign(self.velocity);
        // reset accelertion to 0 each cycle
        self.acceleration = Vector3::new(0., 0., 0.);
    }

    // a method that calculates and applies a steering force towards a target
    // steer = desired minus velocity
    fn seek(&self, target: &Vector3<f32>, bird_config: &BirdConfig) -> Vector3<f32> {
        target
            .sub(self.position)
            // normalize desired and scale to maximum speed
            .normalize()
            .mul(bird_config.max_speed)
            // steering = desired minus velocity
            .sub(self.velocity);

        target
            .xyz()
            .map(|num| {
                num.clamp(-bird_config.max_force, bird_config.max_speed)
            })
    }

    // wrap when going offscreen
    fn borders(&mut self, bird_config: &BirdConfig, width: &f32, height: &f32) {
        let half_width = width / 2.;
        let half_height = height / 2.;
        let half_bird_size = bird_config.bird_size / 2.;
        if self.position.x < -half_width {
            self.position.x = half_width + half_bird_size;
        }
        if self.position.y < -half_height {
            self.position.y = half_height + half_bird_size;
        }
        if self.position.x > half_width + half_bird_size {
            self.position.x = -half_width;
        }
        if self.position.y > half_height + half_bird_size {
            self.position.y = -half_height;
        }
    }

    // separation
    // method checks for nearby birds and steers away
    fn separate(
        &self,
        bird_position: &Vec<Vector3<f32>>,
        bird_config: &BirdConfig,
    ) -> Vector3<f32> {
        let desiredseparation = 25.0;
        let mut steer = Vector3::new(0., 0., 0.);
        let mut count = 0.;
        // for every boid in the system, check if it's too close
        for position in bird_position.to_vec() {
            let d = self.position.metric_distance(&position);
            // if the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            if (d > 0.) && (d < desiredseparation) {
                // calculate vector pointing away from neighbor
                steer.add(self.position.sub(position).normalize());
                count += 1.; // keep track of how many
            }
        }
        // average -- divide by how many
        if count > 0. {
            steer.div_assign(count);
        }

        // as long as the vector is greater than 0
        if steer.angle(&Vector3::new(1., 0., 0.)) > 0. {
            // implement reynolds: steering = desired - velocity
            steer = steer.normalize();
            steer.mul_assign(bird_config.max_speed);
            steer.sub_assign(self.velocity);
            steer.iter().map(|num| num.clamp(-bird_config.max_force, bird_config.max_force));
        }
        return steer;
    }

    // alignment
    // for every nearby boid in the system, calculate the average velocity
    fn align(&self, bird_positions: &Vec<Vector3<f32>>, bird_config: &BirdConfig) -> Vector3<f32> {
        let neighbordist = bird_config.neighbor_distance;
        let mut sum = Vector3::new(0., 0., 0.);
        let mut count = 0.;
        for position in bird_positions.to_vec() {
            let d = self.position.metric_distance(&position);
            if (d > 0.) && (d < neighbordist) {
                sum.add_assign(self.velocity);
                count += 1.;
            }
        }
        if count > 0. {
            sum /= count;
            sum = sum.normalize();
            sum *= bird_config.max_speed;
            let steer = Vector3::sub(sum, self.velocity);
            steer.iter().map(|num| num.clamp(-bird_config.max_force, bird_config.max_force));
            return steer;
        } else {
            return Vector3::new(0., 0., 0.);
        }
    }

    // cohesion
    // for the average location (i.e. center) of all nearby birds, calculate steering vector towards that location
    fn cohesion(
        &self,
        bird_positions: &Vec<Vector3<f32>>,
        bird_config: &BirdConfig,
    ) -> Vector3<f32> {
        let neighbordist = bird_config.neighbor_distance;
        let mut sum = Vector3::new(0., 0., 0.); // start with empty vector to accumulate all locations
        let mut count = 0.;
        for position in bird_positions.to_vec() {
            let d = self.position.metric_distance(&position);
            if (d > 0.) && (d < neighbordist) {
                sum.add_assign(self.position); // add location
                count += 1.;
            }
        }
        if count > 0. {
            sum.div_assign(count);
            return self.seek(&sum, bird_config); // steer towards the location
        } else {
            return Vector3::new(0., 0., 0.);
        }
    }

    // return equilateral triangle centered around self.pos
    // with side lengths of bird_size,
    pub fn get_vertices(&self, bird_config: &BirdConfig) -> Vec<f32> {
        let position = Vector3::new(self.position.x, self.position.y, 0.);
        // let angle = self.velocity.angle(Vector3::new(1., 0., 0.))
        let angle = self.velocity.angle(&Vector3::new(1., 0., 0.));
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
        .map(|e| rot_matrix.mul(e.add(position)))
        // format into flattened vec of f32
        .iter()
        .flatten()
        .map(|e| *e) // ! kinda hacky
        .collect::<Vec<f32>>()
    }
}

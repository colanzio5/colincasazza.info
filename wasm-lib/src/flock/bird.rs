use kd_tree::{KdPoint, KdTree2};
use nalgebra::{Matrix3, Vector3};
use std::{
    f32::consts::PI,
    ops::{Add, Mul, Sub},
};

use crate::utils::clamp_magnitude;

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
    ) {
        self.borders(bird_config, height, width);
        self.apply_flock_forces(birds, bird_config);
        self.update_physics(bird_config);
    }

    // we accumulate a new acceleration each time based on three rules
    fn apply_flock_forces(&mut self, birds: &KdTree2<Bird>, bird_config: &BirdConfig) {
        let sep = self.separate(&birds, bird_config);
        let ali = self.align(&birds, bird_config);
        let coh = self.cohesion(&birds, bird_config);

        // weight from bird "species"
        // add the force vectors to acceleration
        self.acceleration += sep * bird_config.separation_multiplier;
        self.acceleration += ali * bird_config.alignment_multiplier;
        self.acceleration += coh * bird_config.cohesion_multiplier;
    }

    // method to update location
    fn update_physics(&mut self, bird_config: &BirdConfig) {
        // update velocity
        self.velocity += self.acceleration;
        // limit speed
        clamp_magnitude(&mut self.velocity, bird_config.max_speed);
        self.position += self.velocity;
        // reset accelertion to 0 each cycle
        self.acceleration = Vector3::new(0., 0., 0.);
    }

    // a method that calculates and applies a steering force towards a target
    // steer = desired minus velocity
    fn seek(&self, target: &Vector3<f32>, bird_config: &BirdConfig) -> Vector3<f32> {
        target
            .sub(self.position)
            .normalize()
            .mul(bird_config.max_speed)
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

    fn separate(&self, birds: &KdTree2<Bird>, bird_config: &BirdConfig) -> Vector3<f32> {
        let mut steer = Vector3::new(0., 0., 0.);
        let mut count = 0.;
        birds
            .within_radius(self, bird_config.desired_separation)
            .iter()
            .for_each(|other_bird| {
                let d = self.position.metric_distance(&other_bird.position);
                // if the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
                // calculate vector pointing away from neighbor
                let mut diff = self.position.sub(other_bird.position);
                diff = diff.normalize();
                diff /= d;
                steer += diff;
                count += 1.;
            });
        // average -- divide by how many
        if count > 0. {
            steer /= count;
        }
        // as long as the vector is greater than 0
        if steer.magnitude() > 0. {
            // implement reynolds: steering = desired - velocity
            steer = steer.normalize();
            steer *= bird_config.max_speed;
            steer -= self.velocity;
            clamp_magnitude(&mut steer, bird_config.max_force);
        }
        steer
    }

    // alignment
    // for every nearby boid in the system, calculate the average velocity
    fn align(&self, birds: &KdTree2<Bird>, bird_config: &BirdConfig) -> Vector3<f32> {
        let mut sum = Vector3::new(0., 0., 0.);
        let mut count = 0.;
        birds
            .within_radius(self, bird_config.neighbor_distance)
            .iter()
            .for_each(|other_bird| {
                sum += other_bird.velocity;
                count += 1.;
            });
        if count > 0. {
            sum /= count;
            // first two lines of code below could be condensdded with vector3 setmag() method
            // not using this method until processing.js catches up
            // sum.setmag(maxspeed);
            // implement reynolds: stedering = desired - velocity
            sum = sum.normalize();
            sum *= bird_config.max_speed;
            let mut steer = sum.sub(self.velocity);
            clamp_magnitude(&mut steer, bird_config.max_force);
            return steer;
        }
        Vector3::new(0., 0., 0.)
    }

    // cohesion
    // for the average location (i.e. center) of all nearby birds, calculate steering vector towards that location
    fn cohesion(&self, birds: &KdTree2<Bird>, bird_config: &BirdConfig) -> Vector3<f32> {
        let mut sum = Vector3::new(0., 0., 0.); // start with empty vector to accumulate all positions
        let mut count = 0.;

        birds
            .within_radius(self, bird_config.neighbor_distance)
            .iter()
            .for_each(|other_bird| {
                let d = Vector3::metric_distance(&self.position, &other_bird.position);
                if (d > 0.) && (d < bird_config.neighbor_distance) {
                    sum += other_bird.position; // add position
                    count += 1.;
                }
            });

        if count > 0. {
            sum /= count;
            return self.seek(&sum, bird_config); // steer towards the position
        } else {
            return Vector3::new(0., 0., 0.);
        }
    }

    // return equilateral triangle centered around self.pos
    // with side lengths of bird_size,
    pub fn get_vertices(&self, bird_config: &BirdConfig) -> Vec<f32> {
        let position = Vector3::new(self.position.x, self.position.y, 0.);
        // let angle = self.velocity.angle(vector3::new(1., 0., 0.))
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
        .map(|e| rot_matrix.mul(e).add(position))
        // format into flattened vec of f32
        .iter()
        .flatten()
        .map(|e| *e) // ! kinda hacky
        .collect::<Vec<f32>>()
    }
}

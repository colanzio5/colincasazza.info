use kd_tree::{KdPoint, KdTree2};
use nalgebra::{Matrix3, Vector3};
use ordered_float::Float;
use std::f32::consts::PI;

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
        time_step: &f32,
    ) {
        self.borders(bird_config, width, height);
        self.apply_flock_forces(birds, bird_config);
        // update physics (newton style)
        self.velocity += 0.5 * (self.acceleration * (time_step*time_step));
        self.position += *time_step * self.velocity;
        // reset accelertion to 0 each cycle
        // self.acceleration = Vector3::new(0., 0., 0.);
    }

    // we accumulate a new acceleration each time based on three rules
    fn apply_flock_forces(&mut self, birds: &KdTree2<Bird>, bird_config: &BirdConfig) {
        // weight from bird "species"
        // add the force vectors to acceleration
        // self.acceleration += self.separate(&birds, bird_config) * bird_config.separation_multiplier;
        // self.acceleration += self.align(&birds, bird_config) * bird_config.alignment_multiplier;
        // self.acceleration += self.cohesion(&birds, bird_config) * bird_config.cohesion_multiplier;
        self.acceleration += self.fast_flock_physics(&birds, bird_config);
        // limit forces
        clamp_magnitude(&mut self.acceleration, bird_config.max_force);
        clamp_magnitude(&mut self.velocity, bird_config.max_speed);
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

    // Separation
    // Method checks for nearby boids and steers away
    fn separate(&self, birds: &KdTree2<Bird>, bird_config: &BirdConfig) -> Vector3<f32> {
        let mut steer = Vector3::new(0., 0., 0.);

        let birds_to_avoid = birds.within_radius(self, bird_config.desired_separation);
        let num_birds_to_avoid = birds_to_avoid.len() as f32;

        birds_to_avoid.iter()
            .for_each(|other_bird| {
                // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
                let mut diff = self.position - other_bird.position;
                diff.normalize_mut();
                if diff.magnitude().is_normal() {
                    steer += diff / diff.magnitude();
                }
            });

        // Average -- divide by how many
        if num_birds_to_avoid.is_normal() {
            steer *= 1. / num_birds_to_avoid;
        }

        // As long as the vector is greater than 0
        if steer.magnitude() > 0. {
            // Implement Reynolds: Steering = Desired - Velocity
            steer.set_magnitude(bird_config.max_speed);
            steer -= self.velocity;
            clamp_magnitude(&mut steer, bird_config.max_force);
        }
        steer
    }

    // alignment
    // for every nearby boid in the system, calculate the average velocity
    fn align(&self, birds: &KdTree2<Bird>, bird_config: &BirdConfig) -> Vector3<f32> {
        let mut steer = Vector3::new(0., 0., 0.);
        
        let birds_to_follow = birds.within_radius(self, bird_config.desired_separation);
        let num_birds_to_follow = birds_to_follow.len() as f32;

        birds_to_follow
            .iter()
            .for_each(|other_bird| {
                steer += other_bird.velocity;
            });
        if num_birds_to_follow > 0. {
            steer /= num_birds_to_follow;
            // implement reynolds: stedering = desired - velocity
            steer -= self.velocity;
            clamp_magnitude(&mut steer, bird_config.max_force);
        }
        steer
    }

    // cohesion
    // for the average location (i.e. center) of all nearby birds, calculate steering vector towards that location
    fn cohesion(&self, birds: &KdTree2<Bird>, bird_config: &BirdConfig) -> Vector3<f32> {
        let mut steer = Vector3::new(0., 0., 0.); // start with empty vector to accumulate all positions
        let birds_to_follow = birds.within_radius(self, bird_config.desired_separation);
        let num_birds_to_follow = birds_to_follow.len() as f32;
        birds_to_follow
            .iter()
            .for_each(|other_bird| {
                let d = Vector3::metric_distance(&self.position, &other_bird.position);
                steer += other_bird.position; // add position
            });
        if num_birds_to_follow.is_normal() {
            steer /= num_birds_to_follow;
            steer -= self.position;
            clamp_magnitude(&mut steer, bird_config.max_speed);
        }
        steer
    }
    

    fn fast_flock_physics(&self, birds: &KdTree2<Bird>, bird_config: &BirdConfig) -> Vector3<f32> {
        
        let mut f_net = Vector3::new(0.,0.,0.);
        let birds_to_follow = birds.within_radius(self, bird_config.desired_separation);
        let num_birds_to_follow = birds_to_follow.len() as f32;
        let birds_to_avoid = birds.within_radius(self, bird_config.desired_separation);
        let num_birds_to_avoid = birds_to_avoid.len() as f32;
        
        // separation
        let mut sep = Vector3::new(0., 0., 0.); // start with empty vector to accumulate all positions
        birds_to_avoid.iter()
            .for_each(|other_bird| {
                // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
                let mut diff = self.position - other_bird.position;
                diff.normalize_mut();
                if diff.magnitude().is_normal() {
                    sep += diff / diff.magnitude();
                }
            });

        // Average -- divide by how many
        if num_birds_to_avoid.is_normal() {
            sep *= 1. / num_birds_to_avoid;
        }

        // As long as the vector is greater than 0
        if sep.magnitude() > 0. {
            // Implement Reynolds: Steering = Desired - Velocity
            sep.set_magnitude(bird_config.max_speed);
            sep -= self.velocity;
            clamp_magnitude(&mut sep, bird_config.max_force);
        }
        f_net += sep * bird_config.separation_multiplier;

        // alignment
        let mut ali = Vector3::new(0., 0., 0.); // start with empty vector to accumulate all positions
        birds_to_follow
            .iter()
            .for_each(|other_bird| {
                ali += other_bird.velocity;
            });
        if num_birds_to_follow > 0. {
            ali /= num_birds_to_follow;
            // implement reynolds: stedering = desired - velocity
            ali -= self.velocity;
            clamp_magnitude(&mut ali, bird_config.max_force);
        }
        f_net += ali * bird_config.alignment_multiplier;

        // cohesion
        let mut coh = Vector3::new(0., 0., 0.); // start with empty vector to accumulate all positions
        birds_to_follow
            .iter()
            .for_each(|other_bird| {
                let d = Vector3::metric_distance(&self.position, &other_bird.position);
                coh += other_bird.position; // add position
            });
        if num_birds_to_follow.is_normal() {
            coh /= num_birds_to_follow;
            coh -= self.position;
            clamp_magnitude(&mut coh, bird_config.max_speed);
        }
        f_net += coh * bird_config.alignment_multiplier;


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

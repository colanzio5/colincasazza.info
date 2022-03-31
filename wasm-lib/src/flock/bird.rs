use std::{
    collections::VecDeque,
    f32::consts::PI,
    ops::{Add, AddAssign, DivAssign, Mul, MulAssign, Sub, SubAssign},
};

// use crate::utils::log;

use glam::{Mat2, Mat3, Vec3};

use crate::utils::log;

use super::bird_config::BirdConfig;


#[derive(Clone)]
pub struct Bird {
    pub position: Vec3,
    pub velocity: Vec3,
    pub acceleration: Vec3,
    pub config_id: String,
}

impl Bird {
    pub fn update_bird(
        &mut self,
        birds: &Vec<Vec3>,
        bird_config: &BirdConfig,
        width: &f32,
        height: &f32,
    ) {
        self.borders(bird_config, height, width);
        self.apply_flock_forces(birds, bird_config);
        self.update_physics(bird_config);
    }

    // We accumulate a new acceleration each time based on three rules
    fn apply_flock_forces(&mut self, birds: &Vec<Vec3>, bird_config: &BirdConfig) {
        let mut sep = self.separate(&birds, bird_config); // separation
        let mut ali = self.align(&birds, bird_config); // alignment
        let mut coh = self.cohesion(&birds, bird_config); // cohesion
                                                         // weight from bird "species"
        sep.mul_assign(bird_config.separation_multiplier);
        ali.mul_assign(bird_config.alignment_multiplier);
        coh.mul_assign(bird_config.cohesion_multiplier);
        // Add the force vectors to acceleration
        self.acceleration.add_assign(sep);
        self.acceleration.add_assign(ali);
        self.acceleration.add_assign(coh);
    }

    // Method to update location
    fn update_physics(&mut self, bird_config: &BirdConfig) {
        // self.debug();
        // Update velocity
        self.velocity.add_assign(self.acceleration);
        // Limit speed
        self.velocity = self
            .velocity
            .clamp_length(-bird_config.max_speed, bird_config.max_speed);
        self.position.add_assign(self.velocity);
        // Reset accelertion to 0 each cycle
        // self.acceleration.normalize_or_zero();
        // self.acceleration = self.acceleration.clamp_length(-bird_config.max_force, bird_config.max_force);
    }

    // A method that calculates and applies a steering force towards a target
    // STEER = DESIRED MINUS VELOCITY
    fn seek(&self, target: &Vec3, bird_config: &BirdConfig) -> Vec3 {
        target.sub(self.position)
            // Normalize desired and scale to maximum speed
            .normalize()
            .mul(bird_config.max_speed)
            // Steering = Desired minus Velocity
            .sub(self.velocity)
            .clamp_length(-bird_config.max_force, bird_config.max_force)
    }

    // Wraparound
    fn borders(&mut self, bird_config: &BirdConfig, width: &f32, height: &f32) {
        let half_width = width;
        let half_height = height;
        if self.position.x < -half_width {
            self.position.x = half_width + bird_config.bird_size;
        }
        if self.position.y < -half_height {
            self.position.y = half_height + bird_config.bird_size;
        }
        if self.position.x > half_width + bird_config.bird_size {
            self.position.x = -half_width;
        }
        if self.position.y > half_height + bird_config.bird_size {
            self.position.y = -half_height;
        }
    }

    // Separation
    // Method checks for nearby birds and steers away
    fn separate(&self, bird_position: &Vec<Vec3>, bird_config: &BirdConfig) -> Vec3 {
        let desiredseparation = 25.0;
        let current_position = Vec3::new(self.position.x, self.position.y, 0.);
        let mut steer = Vec3::new(0., 0., 0.);
        let mut count = 0.;
        // For every boid in the system, check if it's too close
        for position in bird_position.to_vec() {
            let d = Vec3::distance(current_position, position);
            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            if (d > 0.) && (d < desiredseparation) {
                // Calculate vector pointing away from neighbor
                let diff = position.sub(current_position);
                diff.normalize().div_assign(d); // Weight by distance
                steer.add_assign(diff);
                count += 1.; // Keep track of how many
            }
        }
        // Average -- divide by how many
        if count > 0. {
            steer.div_assign(count);
        }

        // As long as the vector is greater than 0
        if steer.angle_between(Vec3::new(1., 0., 0.)) > 0. {
            // Implement Reynolds: Steering = Desired - Velocity
            steer = steer.normalize();
            steer.mul_assign(bird_config.max_speed);
            steer.sub_assign(self.velocity);
            steer.clamp_length(-bird_config.max_force, bird_config.max_force);
        }
        return steer;
    }

    // Alignment
    // For every nearby boid in the system, calculate the average velocity
    fn align(&self, bird_positions: &Vec<Vec3>, bird_config: &BirdConfig) -> Vec3 {
        let neighbordist = bird_config.neighbor_distance;
        let mut sum = Vec3::new(0., 0., 0.);
        let mut count = 0.;
        for position in bird_positions.to_vec() {
            let d = Vec3::distance(self.position, position);
            if (d > 0.) && (d < neighbordist) {
                sum.add_assign(self.velocity);
                count += 1.;
            }
        }
        if count > 0. {
            sum.div_assign(count);
            sum = sum.normalize();
            sum.mul_assign(bird_config.max_speed);
            let steer = Vec3::sub(sum, self.velocity);
            steer.clamp_length(-bird_config.max_force, bird_config.max_force);
            return steer;
        } else {
            return Vec3::new(0., 0., 0.);
        }
    }

    // Cohesion
    // For the average location (i.e. center) of all nearby birds, calculate steering vector towards that location
    fn cohesion(&self, bird_positions: &Vec<Vec3>, bird_config: &BirdConfig) -> Vec3 {
        let neighbordist = bird_config.neighbor_distance;
        let mut sum = Vec3::new(0., 0., 0.); // Start with empty vector to accumulate all locations
        let mut count = 0.;
        for position in bird_positions.to_vec() {
            let d = Vec3::distance(self.position, position);
            if (d > 0.) && (d < neighbordist) {
                sum.add_assign(self.position); // Add location
                count += 1.;
            }
        }
        if count > 0. {
            sum.div_assign(count);
            return self.seek(&sum, bird_config); // Steer towards the location
        } else {
            return Vec3::new(0., 0., 0.);
        }
    }

    pub fn get_vertices(&self, bird_config: &BirdConfig) -> Vec<f32> {
        // equaliteral trongle math <:)
        let position = Vec3::new(self.position.x, self.position.y, 0.);
        let angle = self
            .velocity
            .clone()
            .angle_between(Vec3::new(1., 0., 0.));
            // .sub(3. * (PI / 2.));
        let rot_matrix = Mat3::from_cols(
            Vec3::new(angle.cos(), angle.sin(), 0.),
            Vec3::new(-angle.sin(), angle.cos(), 0.),
            Vec3::new(0., 0., 1.),
        );
        // triangle vertices
        let q = bird_config.bird_size / (2. * (PI / 6.).cos());
        let r = (PI / 6.).tan() * (bird_config.bird_size / 2.);
        // format into flattened vec of f32
        [
            Vec3::new(0., q * 2., 0.),
            Vec3::new(-bird_config.bird_size / 2., -r, 0.),
            Vec3::new(bird_config.bird_size / 2., -r, 0.),
            Vec3::new(0., q * 2., 0.),
        ]
        .map(|e| rot_matrix.mul_vec3(e).add(position).to_array().to_vec())
        .iter()
        .flatten()
        .map(|e| *e)
        .collect::<Vec<f32>>()
    }

    fn _debug(&self) {
        let log_string = format!(
            "acc: {},{} | vel: {},{} | pos: {},{}",
            self.acceleration.x,
            self.acceleration.y,
            self.velocity.x,
            self.velocity.y,
            self.position.x,
            self.position.x,
        );
        log(&log_string);
    }
}

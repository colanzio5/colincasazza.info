use core::num;
use kd_tree::{KdPoint, KdTree2};
use nalgebra::{Matrix2, Matrix3, Vector2};
use ordered_float::Float;
use std::{f32::consts::PI, ops::Mul};

use crate::{
    flock::bird,
    utils::{clamp_magnitude, nearly_equal},
};

use super::bird_config::BirdConfig;

#[derive(Clone)]
pub struct Bird {
    pub position: Vector2<f32>,
    pub velocity: Vector2<f32>,
    pub acceleration: Vector2<f32>,
    pub config_id: String,
}

impl KdPoint for Bird {
    type Scalar = f32;
    type Dim = typenum::U2;
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
        self.seperate(birds, bird_config);
        self.align(birds, bird_config);
        self.cohesion(birds, bird_config);

        clamp_magnitude(&mut self.acceleration, bird_config.max_force);
        self.velocity += 0.5 * (self.acceleration * (time_step * time_step));
        clamp_magnitude(&mut self.velocity, bird_config.max_speed);
        self.position += *time_step * self.velocity;

        self.acceleration = Vector2::new(0., 0.);
    }

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

    fn seperate(&mut self, birds: &KdTree2<Bird>, bird_config: &BirdConfig) {
        let mut steer = Vector2::new(0., 0.);
        let mut count = 0;
        let other_birds = birds.within_radius(self, bird_config.desired_separation);

        other_birds.iter().for_each(|other_bird| {
            let d = self.position.metric_distance(&other_bird.position);
            if d > 0. && d < bird_config.desired_separation {
                let mut diff = self.position - other_bird.position;
                diff = diff.normalize();
                steer = steer + diff;
                count = count + 1;
            }
        });

        if count as f32 > 0. && (count as f32).is_normal() {
            steer = steer / count as f32;
        }

        if steer.norm() > 0. && steer.norm().is_normal() {
            steer = steer.normalize();
            steer = steer * (bird_config.max_speed);
            steer = steer - self.velocity;
            clamp_magnitude(&mut steer, bird_config.max_speed);
        }

        self.acceleration = self.acceleration + (bird_config.separation_multiplier * steer);
    }

    fn align(&mut self, birds: &KdTree2<Bird>, bird_config: &BirdConfig) {
        let mut sum = Vector2::new(0., 0.);
        let mut count = 0;
        let mut steer = Vector2::new(0., 0.);
        let other_birds = birds.within_radius(self, bird_config.neighbor_distance);

        other_birds.iter().for_each(|other_bird| {
            let d = self.position.metric_distance(&other_bird.position);
            if (d > 0.0) && (d < bird_config.neighbor_distance) {
                sum = sum + other_bird.velocity;
                count = count + 1;
            }
        });

        if count as f32 > 0. && (count as f32).is_normal() {
            sum = sum / count as f32;
            sum = sum.normalize();
            sum = sum * bird_config.max_speed;
            steer = sum - self.velocity;
            clamp_magnitude(&mut steer, bird_config.max_force);
        }

        self.acceleration = self.acceleration + (bird_config.alignment_multiplier * steer);
    }

    fn cohesion(&mut self, birds: &KdTree2<Bird>, bird_config: &BirdConfig) {
        let mut sum = Vector2::new(0., 0.);
        let mut count = 0;
        let mut steer = Vector2::new(0., 0.);
        let other_birds = birds.within_radius(self, bird_config.neighbor_distance);

        other_birds.iter().for_each(|other_bird| {
            let d = self.position.metric_distance(&other_bird.position);
            if (d > 0.0) && (d < bird_config.neighbor_distance) {
                sum = sum + other_bird.position;
                count = count + 1;
            }
        });
        if count as f32 > 0. && (count as f32).is_normal() {
            sum = sum / count as f32;
            let mut desired = sum - self.position;
            desired = desired.normalize();
            desired = desired * bird_config.max_speed;
            steer = desired - self.velocity;
            clamp_magnitude(&mut steer, bird_config.max_force);
        }

        self.acceleration = self.acceleration + (bird_config.cohesion_multiplier * steer);
    }

    fn apply_flock_forces(&self, birds: &KdTree2<Bird>, bird_config: &BirdConfig) -> Vector2<f32> {
        let other_birds = birds.within_radius(self, bird_config.neighbor_distance);
        let num_other_birds = other_birds.len() as f32;
        let mut sep = Vector2::new(0., 0.);
        let mut ali = Vector2::new(0., 0.);
        let mut coh = Vector2::new(0., 0.);
        other_birds.iter().for_each(|other_bird| {
            let diff = self.position - other_bird.position;
            let d = diff.norm();
            if d > f32::MIN {
                if d > bird_config.desired_separation {
                    sep += diff;
                }
                ali += other_bird.velocity;
                coh -= other_bird.position;
            }
        });

        if num_other_birds > 0. {
            sep /= num_other_birds;
            ali *= num_other_birds;
            ali.set_magnitude(bird_config.max_speed);
            clamp_magnitude(&mut ali, bird_config.max_speed);
            coh /= num_other_birds;
        }

        if sep.magnitude() > 0. {
            sep.set_magnitude(bird_config.max_speed);
            sep += self.velocity;
            clamp_magnitude(&mut sep, bird_config.max_force);
        }

        let f_net = Vector2::new(0., 0.)
            + (sep * bird_config.separation_multiplier)
            + (ali * bird_config.alignment_multiplier)
            + (coh * bird_config.alignment_multiplier);

        f_net
    }

    pub fn get_vertices(&self, bird_config: &BirdConfig) -> Vec<Vector2<f32>> {
        let angle = self.velocity.angle(&Vector2::new(0., 1.));

        let rot_matrix = Matrix2::from_columns(&[
            Vector2::new(angle.cos(), angle.sin()),
            Vector2::new(-angle.sin(), angle.cos()),
        ]);

        let q = bird_config.bird_size / (2. * (PI / 6.).acos());
        let r = (PI / 6.).tan() * (bird_config.bird_size / 2.);

        [
            Vector2::new(0., q * 2.),
            Vector2::new(-bird_config.bird_size / 2., -r),
            Vector2::new(bird_config.bird_size / 2., -r),
            Vector2::new(0., q * 2.),
        ]
        .map(|e| rot_matrix * e)
        .map(|e| e + self.position)
        .to_vec()
    }
}

pub mod game_of_life;
mod utils;
use rand::seq::SliceRandom;
use rand::thread_rng;
use rand::Rng;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn say_wan() -> u8 {
    1
}

#[wasm_bindgen]
pub fn convert_pixels(source: &[u8], size: Size, color_settings: &JsValue) -> Vec<u8> {
    let pixel_count = (size.height * size.width) as usize;
    let visited_len: usize = pixel_count / 64 + (if pixel_count % 64 == 0 { 0 } else { 1 });
    let mut visited: Vec<u64> = vec![0; visited_len];
    let mut target = vec![0; pixel_count * 4];
    let mut visited_index: usize = 0;
    let color_settings: ColorSettings = color_settings.into_serde().unwrap();

    loop {
        let bit_index = visited[visited_index].leading_ones();

        let target_index = visited_index * 64 + (bit_index as usize);
        if target_index >= pixel_count {
            break;
        }
        if bit_index >= 64 {
            visited_index += 1;
            continue;
        }

        let source_index = utils::get_source_index_from_target_index(target_index, &size, &size, 1);
        let initial_color = create_color_from_index(&source, source_index as usize);
        let area_color = create_transformed_color(&initial_color, &color_settings);

        paint_current_area(
            &mut visited,
            &mut target,
            source,
            &size,
            target_index,
            &area_color,
            &initial_color,
            color_settings.squared_tolerance,
        )
    }

    target
}

fn create_color_from_index(pixels: &[u8], index: usize) -> Color {
    Color {
        r: pixels[index * 4],
        g: pixels[index * 4 + 1],
        b: pixels[index * 4 + 2],
        a: pixels[index * 4 + 3],
    }
}

fn paint_current_area(
    visited: &mut Vec<u64>,
    target: &mut Vec<u8>,
    source: &[u8],
    size: &Size,
    initial_target_index: usize,
    area_color: &Color,
    initial_color: &Color,
    squared_tolerance: f32,
) {
    let mut stack = Vec::new();
    stack.push(initial_target_index);

    while let Some(target_index) = stack.pop() {
        let source_index = utils::get_source_index_from_target_index(target_index, &size, &size, 1);
        let source_color = create_color_from_index(source, source_index);
        let target_point = utils::get_point_from_pixel_index(target_index, size.width);

        let adjacent_points = utils::get_adjacent_points(&target_point, &size);

        // anti-aliasing
        if !utils::are_colors_similar(&initial_color, &source_color, squared_tolerance) {
            let mut similar_point_count = 0;
            for adjacent_candidate in adjacent_points.iter() {
                match adjacent_candidate {
                    Some(adjacent) => {
                        let adj_index = utils::get_pixel_index_from_point(&adjacent, size.width);
                        if is_index_visited(visited, adj_index) {
                            continue;
                        }
                        let adj_source_index =
                            utils::get_source_index_from_target_index(adj_index, &size, &size, 1);
                        let adj_source_color = create_color_from_index(source, adj_source_index);
                        if utils::are_colors_similar(
                            &adj_source_color,
                            &source_color,
                            squared_tolerance,
                        ) {
                            similar_point_count += 1;
                        }
                    }
                    None => {}
                }
            }
            if similar_point_count < 2 {
                let ratio: f32 = if initial_color.r > 0 {
                    source_color.r as f32 / initial_color.r as f32
                } else {
                    1.0
                };
                let anti_aliasing_color = Color {
                    r: (area_color.r as f32 * ratio) as u8,
                    g: (area_color.g as f32 * ratio) as u8,
                    b: (area_color.b as f32 * ratio) as u8,
                    a: 255,
                };
                paint_target_pixels(target, target_index, &anti_aliasing_color, visited);
            }
            continue;
        }
        // end anti-aliasing

        paint_target_pixels(target, target_index, area_color, visited);

        for adjacent_candidate in utils::get_adjacent_points(&target_point, &size).iter() {
            match adjacent_candidate {
                Some(adjacent) => {
                    let adjacent_index = utils::get_pixel_index_from_point(&adjacent, size.width);
                    if is_index_visited(visited, adjacent_index) {
                        continue;
                    }
                    stack.push(adjacent_index);
                }
                None => {}
            }
        }
    }
}

fn is_index_visited(visited: &mut Vec<u64>, index: usize) -> bool {
    (visited[index / 64] & ((1 as u64) << (63 - (index % 64)))) != 0
}

fn paint_target_pixels(target: &mut Vec<u8>, index: usize, color: &Color, visited: &mut Vec<u64>) {
    visited[index / 64] |= (1 as u64) << (63 - (index % 64));

    target[(index * 4) as usize] = color.r;
    target[(index * 4 + 1) as usize] = color.g;
    target[(index * 4 + 2) as usize] = color.b;
    target[(index * 4 + 3) as usize] = color.a;
}

fn create_transformed_color(initial_color: &Color, color_settings: &ColorSettings) -> Color {
    let initial_u32 = utils::color_to_u32(initial_color);

    match color_settings.specific_transforms.get(&initial_u32) {
        Some(transform) => return utils::u32_to_color(*transform),
        None => {}
    }

    if color_settings.is_random {
        return Color {
            r: thread_rng().gen_range(0, 255),
            g: thread_rng().gen_range(0, 255),
            b: thread_rng().gen_range(0, 255),
            a: 255,
        };
    }

    match color_settings.available_colors.choose(&mut thread_rng()) {
        Some(color) => utils::u32_to_color(*color),
        None => return utils::u32_to_color(0),
    }
}

#[wasm_bindgen]
pub struct Size {
    width: u32,
    height: u32,
}
#[wasm_bindgen]
impl Size {
    pub fn new(width: u32, height: u32) -> Size {
        Size {
            width: width,
            height: height,
        }
    }
}

pub struct Point {
    x: u32,
    y: u32,
}

#[derive(Copy, Clone)]
pub struct Color {
    r: u8,
    g: u8,
    b: u8,
    a: u8,
}

#[derive(Serialize, Deserialize)]
pub struct ColorSettings {
    specific_transforms: HashMap<u32, u32>,
    is_random: bool,
    available_colors: Vec<u32>,
    squared_tolerance: f32,
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

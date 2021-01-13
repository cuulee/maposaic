pub mod game_of_life;
mod utils;
use rand::Rng;
use std::collections::HashSet;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
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

#[wasm_bindgen]
pub fn parse_vec(source: &[u8], size: Size) -> Vec<u8> {
    let mut visited: HashSet<usize> = HashSet::new();

    let mut target = vec![0; (size.width * size.height * 4) as usize];

    for i in 0..size.height {
        for j in 0..size.width {
            let target_index = (i * size.width + j) as usize;

            if visited.contains(&target_index) {
                continue;
            }
            let source_index =
                utils::get_source_index_from_target_index(target_index, &size, &size, 1) as usize;

            let initial_color = create_color_from_index(&source, source_index);
            let area_color = create_transformed_color(&initial_color);

            paint_current_area(
                &mut visited,
                &mut target,
                source,
                &size,
                target_index,
                &area_color,
                &initial_color,
            )
        }
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
    visited: &mut HashSet<usize>,
    target: &mut Vec<u8>,
    source: &[u8],
    size: &Size,
    initial_target_index: usize,
    area_color: &Color,
    initial_color: &Color,
) {
    let mut stack = Vec::new();
    stack.push(initial_target_index);

    while let Some(target_index) = stack.pop() {
        visited.insert(target_index);

        target[(target_index * 4) as usize] = area_color.r;
        target[(target_index * 4 + 1) as usize] = area_color.g;
        target[(target_index * 4 + 2) as usize] = area_color.b;
        target[(target_index * 4 + 3) as usize] = area_color.a;

        let target_point = utils::get_point_from_pixel_index(target_index, size.width);

        for adjacent_candidate in utils::get_adjacent_points(&target_point, &size).iter() {
            match adjacent_candidate {
                Some(adjacent) => {
                    let adjacent_index = utils::get_pixel_index_from_point(&adjacent, size.width);
                    if visited.contains(&adjacent_index) {
                        continue;
                    }
                    let source_index =
                        utils::get_source_index_from_target_index(adjacent_index, &size, &size, 1)
                            as usize;
                    let source_color = create_color_from_index(source, source_index);

                    if utils::are_colors_similar(&initial_color, &source_color) {
                        stack.push(adjacent_index);
                    }
                }
                None => {}
            }
        }
    }
}

const WHITE: Color = Color {
    r: 255,
    g: 255,
    b: 255,
    a: 255,
};

fn create_transformed_color(initial_color: &Color) -> Color {
    if utils::are_colors_similar(&initial_color, &WHITE) {
        WHITE.clone()
    } else {
        Color {
            r: rand::thread_rng().gen_range(0, 255),
            g: rand::thread_rng().gen_range(0, 255),
            b: rand::thread_rng().gen_range(0, 255),
            a: 255,
        }
    }
}

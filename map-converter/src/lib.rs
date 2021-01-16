pub mod game_of_life;
mod utils;
use rand::Rng;

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
pub fn convert_pixels(source: &[u8], size: Size) -> Vec<u8> {
    let pixel_count = (size.height * size.width) as usize;
    let visited_len: usize = pixel_count / 64 + (if pixel_count % 64 == 0 { 0 } else { 1 });
    let mut visited: Vec<u64> = vec![0; visited_len];
    let mut target = vec![0; pixel_count * 4];
    let mut visited_index: usize = 0;

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
) {
    let mut stack = Vec::new();
    stack.push(initial_target_index);

    while let Some(target_index) = stack.pop() {
        visited[target_index / 64] |= (1 as u64) << (63 - (target_index % 64));

        target[(target_index * 4) as usize] = area_color.r;
        target[(target_index * 4 + 1) as usize] = area_color.g;
        target[(target_index * 4 + 2) as usize] = area_color.b;
        target[(target_index * 4 + 3) as usize] = area_color.a;

        let target_point = utils::get_point_from_pixel_index(target_index, size.width);

        for adjacent_candidate in utils::get_adjacent_points(&target_point, &size).iter() {
            match adjacent_candidate {
                Some(adjacent) => {
                    let adjacent_index = utils::get_pixel_index_from_point(&adjacent, size.width);
                    if (visited[adjacent_index / 64] & ((1 as u64) << (63 - (adjacent_index % 64))))
                        != 0
                    {
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

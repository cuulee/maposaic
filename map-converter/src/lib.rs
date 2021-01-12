pub mod game_of_life;
mod utils;
use rand::Rng;
use std::collections::HashSet;

use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn run() {
    bare_bones();
    using_a_macro();
    using_web_sys();
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(a: u32);
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u8(a: u8);
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_many(a: &str, b: &str);
}

fn bare_bones() {
    log("Hello from Rust!");
    log_u32(42);
    log_many("Logging", "many values!");
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

fn using_a_macro() {
    console_log!("Hello {}!", "world");
    console_log!("Let's print some numbers...");
    console_log!("1 + 3 = {}", 1 + 3);
}

fn using_web_sys() {
    use web_sys::console;

    console::log_1(&"Hello using web-sys".into());

    let js: JsValue = 4.into();
    console::log_2(&"Logging arbitrary values looks like".into(), &js);
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

#[wasm_bindgen]
pub fn convert(coucou: u8) {
    println!("yoweshhhh");
    log_u8(coucou);
    let secret_number = rand::thread_rng().gen_range(1, 101);
    console_log!("secret is {}", secret_number)
}

#[wasm_bindgen]
pub fn parse_vec(source: &[u8], size: Size) -> Vec<u8> {
    let visited: HashSet<u32> = HashSet::new();

    let mut target = vec![0; (size.width * size.height * 4) as usize];

    for i in 0..size.height {
        for j in 0..size.width {
            let index = i * size.width + j;

            if visited.contains(&index) {
                continue;
            }
            let source_index =
                utils::get_source_pixel_index_from_target_pixel_index(index, &size, &size, 1);
            target[(index * 4) as usize] = source[(source_index * 4) as usize];
            target[(index * 4 + 1) as usize] = source[(source_index * 4 + 1) as usize];
            target[(index * 4 + 2) as usize] = source[(source_index * 4 + 2) as usize];
            target[(index * 4 + 3) as usize] = source[(source_index * 4 + 3) as usize];
        }
    }

    target
}

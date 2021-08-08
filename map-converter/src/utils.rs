use crate::Color;
use crate::Point;
use crate::Size;

pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

pub fn get_point_from_pixel_index(index: usize, width: u32) -> Point {
    Point {
        x: (index as u32) % width,
        y: (index as u32) / width,
    }
}
pub fn get_pixel_index_from_point(point: &Point, width: u32) -> usize {
    (point.y * width + point.x) as usize
}

fn get_source_point_from_target_point(point: &Point, size: &Size, ratio: u32) -> Point {
    Point {
        x: ratio * point.x,
        y: ratio * (size.height - 1 - point.y),
    }
}

pub fn get_source_index_from_target_index(
    target_pixel_index: usize,
    target_size: &Size,
    source_size: &Size,
    ratio: u32,
) -> usize {
    let target = get_point_from_pixel_index(target_pixel_index, target_size.width);
    let source = get_source_point_from_target_point(&target, &target_size, ratio);

    get_pixel_index_from_point(&source, source_size.width)
}

pub fn are_colors_similar(color1: &Color, color2: &Color, squared_tolerance: u32) -> bool {
    ((((color1.r as i32) - (color2.r as i32)).pow(2)
        + ((color1.g as i32) - (color2.g as i32)).pow(2)
        + ((color1.b as i32) - (color2.b as i32)).pow(2)) as u32)
        <= squared_tolerance
}

pub fn get_adjacent_points(point: &Point, size: &Size) -> [Option<Point>; 4] {
    [
        if point.y < size.height - 1 {
            Some(Point {
                x: point.x,
                y: point.y + 1,
            })
        } else {
            None
        },
        if point.x < size.width - 1 {
            Some(Point {
                x: point.x + 1,
                y: point.y,
            })
        } else {
            None
        },
        if point.x > 0 {
            Some(Point {
                x: point.x - 1,
                y: point.y,
            })
        } else {
            None
        },
        if point.y > 0 {
            Some(Point {
                x: point.x,
                y: point.y - 1,
            })
        } else {
            None
        },
    ]
}

pub fn u32_to_color(color: u32) -> Color {
    Color {
        r: ((color >> 16) & 255) as u8,
        g: ((color >> 8) & 255) as u8,
        b: ((color) & 255) as u8,
        a: 255,
    }
}

pub fn color_to_u32(color: &Color) -> u32 {
    (color.r as u32) * 256 * 256 + (color.g as u32) * 256 + (color.b as u32)
}

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

fn get_point_from_pixel_index(index: &u32, width: &u32) -> Point {
    Point {
        x: index % width,
        y: index / width,
    }
}
fn get_pixel_index_from_point(point: &Point, width: &u32) -> u32 {
    point.y * width + point.x
}

fn get_source_point_from_target_point(point: &Point, size: &Size, ratio: u32) -> Point {
    Point {
        x: ratio * point.x,
        y: ratio * (size.height - 1 - point.y),
    }
}

pub fn get_source_pixel_index_from_target_pixel_index(
    target_pixel_index: u32,
    target_size: &Size,
    source_size: &Size,
    ratio: u32,
) -> u32 {
    let target = get_point_from_pixel_index(&target_pixel_index, &target_size.width);
    let source = get_source_point_from_target_point(&target, &target_size, ratio);
    return get_pixel_index_from_point(&source, &source_size.width);
}

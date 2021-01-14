from dataclasses import dataclass


@dataclass
class Point:
    x: int
    y: int


def get_point_from_pixel_index(index, width):
    return Point(index % width, int(index / width))


def get_pixel_index_from_point(point, width):
    return point.y * width + point.x


def get_source_point_from_target_point(point, size, ratio):
    return Point(ratio * point.x, ratio * (size.h - 1 - point.y))


def get_source_index_from_target_index(
    target_pixel_index,
    target_size,
    source_size,
    ratio,
):
    target_point = get_point_from_pixel_index(target_pixel_index, target_size.w)
    source_point = get_source_point_from_target_point(target_point, target_size, ratio)

    return get_pixel_index_from_point(source_point, source_size.w)


def are_colors_similar(color1, color2):
    return color1.r == color2.r and color1.g == color2.g and color1.b == color2.b


def get_adjacent_points(point, size):
    return [
        Point(point.x, point.y + 1) if point.y < size.h - 1 else None,
        Point(point.x + 1, point.y) if point.x < size.w - 1 else None,
        Point(point.x - 1, point.y) if point.x > 0 else None,
        Point(point.x, point.y - 1) if point.y > 0 else None,
    ]

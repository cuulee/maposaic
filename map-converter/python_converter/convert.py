import random
from dataclasses import dataclass

from utils.utils import (
    are_colors_similar,
    get_adjacent_points,
    get_pixel_index_from_point,
    get_point_from_pixel_index,
    get_source_index_from_target_index,
)


@dataclass
class Size:
    w: int
    h: int


@dataclass
class Color:
    r: int
    g: int
    b: int
    a: int


WHITE = Color(255, 255, 255, 255)


size = Size(1000, 800)
source = [random.randint(0, 255) for _ in range(size.w * size.h * 4)]

target = [0] * size.w * size.h * 4
print(len(source), len(target))
# print("before", source)
visited = set()


def paint_current_area(initial_target_index, current_area_color, initial_color):
    stack = []
    stack.append(initial_target_index)
    while stack:
        current_target_index = stack.pop()
        visited.add(current_target_index)

        target[current_target_index * 4] = current_area_color.r
        target[current_target_index * 4 + 1] = current_area_color.g
        target[current_target_index * 4 + 2] = current_area_color.b
        target[current_target_index * 4 + 3] = current_area_color.a

        target_point = get_point_from_pixel_index(current_target_index, size.w)
        for adjacent in get_adjacent_points(target_point, size):
            if adjacent:
                adjacent_index = get_pixel_index_from_point(adjacent, size.w)

                if adjacent_index in visited:
                    continue
                candidate_source_index = get_source_index_from_target_index(
                    adjacent_index, size, size, 1
                )
                candidate_source_color = Color(
                    source[candidate_source_index * 4],
                    source[candidate_source_index * 4 + 1],
                    source[candidate_source_index * 4 + 2],
                    source[candidate_source_index * 4 + 3],
                )

                if are_colors_similar(candidate_source_color, initial_color):
                    stack.append(adjacent_index)


for i in range(size.h):
    for j in range(size.w):
        target_index = i * size.w + j
        if target_index in visited:
            continue
        source_index = get_source_index_from_target_index(target_index, size, size, 1)
        source_color = Color(
            source[source_index * 4],
            source[source_index * 4 + 1],
            source[source_index * 4 + 2],
            source[source_index * 4 + 3],
        )
        area_color = (
            WHITE
            if are_colors_similar(source_color, WHITE)
            else Color(
                random.randint(0, 255),
                random.randint(0, 255),
                random.randint(0, 255),
                255,
            )
        )
        paint_current_area(target_index, area_color, source_color)

# print("after", target)

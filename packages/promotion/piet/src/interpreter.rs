use crate::colors;
use crate::ops;

use wasm_bindgen::Clamped;

pub struct Image {
    pub width: u32,
    pub height: u32,
    pub pixels: Clamped<Vec<u8>>,
}

impl Image {
    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn get_pixel(&self, x: u32, y: u32) -> &colors::Rgba {
        if !self.in_bounds(x, y) {
            return &[];
        }

        let index = ((y * self.width() + x) * 4) as usize;

        &self.pixels[index..index + 4]
    }

    pub fn in_bounds(&self, x: u32, y: u32) -> bool {
        x < self.width() && y < self.height()
    }
}

#[derive(Debug, PartialEq)]
pub enum Direction {
    Left,
    Right,
    Down,
    Up,
}

impl Direction {
    pub fn step(&mut self) {
        *self = match *self {
            Direction::Left => Direction::Up,
            Direction::Right => Direction::Down,
            Direction::Down => Direction::Left,
            Direction::Up => Direction::Right,
        }
    }

    pub fn step_counter(&mut self) {
        *self = match *self {
            Direction::Left => Direction::Down,
            Direction::Right => Direction::Up,
            Direction::Down => Direction::Right,
            Direction::Up => Direction::Left,
        }
    }
}

#[derive(Debug)]
pub enum CodelChooser {
    Right,
    Left,
}

impl CodelChooser {
    pub fn toggle(&mut self) {
        *self = match *self {
            CodelChooser::Right => CodelChooser::Left,
            CodelChooser::Left => CodelChooser::Right,
        };
    }
}

pub struct Interpreter<'a> {
    pub codel_chooser: CodelChooser,
    pub direction_pointer: Direction,
    image: &'a Image,
    current_color: &'a colors::Rgba,
    pub current_size: u32,
    pub stack: Vec<i32>,
    pub input: String,
    pub output: String,

    // max available steps to prevent infinite loops, when it runs out the interpreter will exit
    pub steps: i32,
}

impl<'a> Interpreter<'a> {
    pub fn new(image: &'a Image, input: &'a str) -> Interpreter<'a> {
        Interpreter {
            codel_chooser: CodelChooser::Left,
            direction_pointer: Direction::Right,
            current_color: image.get_pixel(0, 0),
            current_size: 0,
            image,
            output: String::new(),
            stack: Vec::new(),
            steps: 1000,

            // the input string should be reversed because we'll be using pop() on it
            input: input.chars().rev().collect(),
        }
    }

    pub fn run(&mut self) {
        let mut failed_attempts = 0;
        let mut failed_white_attempts = 0;
        let mut x = 0;
        let mut y = 0;

        loop {
            self.steps -= 1;

            if self.steps == 0 {
                return;
            }

            // If white just sail through until we hit another color
            if self.current_color_code() == 1 {
                let (x_next, y_next) = self.move_step(x, y);
                // If in white and hit boundary or black then step through dp
                if self.restricted(x_next, y_next) {
                    self.codel_chooser.toggle();
                    self.direction_pointer.step();
                    failed_white_attempts += 1;
                } else {
                    x = x_next;
                    y = y_next;
                    self.current_color = self.pixel_at(x, y);
                    failed_attempts = 0;
                    failed_white_attempts = 0;
                }

                if failed_white_attempts == 4 {
                    break;
                }
            } else {
                let (x_next, y_next, size) = self.next_block(x, y);
                // If we are hitting the edge or a black codel try another direction
                if self.restricted(x_next, y_next) {
                    self.update_movement(failed_attempts);
                    failed_attempts += 1;
                } else {
                    // here we move into the next color block after processing the action
                    x = x_next;
                    y = y_next;

                    let next_color = self.pixel_at(x, y);
                    self.current_size = size;
                    self.process_action(&next_color);
                    self.current_color = next_color;
                    failed_attempts = 0;
                    failed_white_attempts = 0;
                }

                if failed_attempts == 8 {
                    break;
                }
            }
        }
    }

    fn process_action(&mut self, next_color: &colors::Rgba) {
        let color_code = colors::color_code(next_color).unwrap();
        if color_code != 1 {
            let curr_color = self.current_color_code();
            let shade_diff = colors::shade_difference(curr_color, color_code);
            let hue_diff = colors::hue_difference(curr_color, color_code);
            ops::call_op(self, (hue_diff, shade_diff));
        }
    }

    // Based on the number of attempts this either toggles the CC back and forth
    // or updates the current direction of the DP
    fn update_movement(&mut self, attempts: i32) {
        if attempts % 2 == 0 {
            self.codel_chooser.toggle();
        } else {
            self.direction_pointer.step();
        }
    }

    // This method sets the current size after finding the next block
    fn next_block(&mut self, x: i32, y: i32) -> (i32, i32, u32) {
        let marked_size = self.image.width() * self.image.height();
        let mut marked = vec![false; marked_size as usize];
        let mut size = 0;
        let mut mx = x;
        let mut my = y;
        self.block_walk_recursive(&mut size, x, y, &mut mx, &mut my, &mut marked);
        let (x, y) = self.move_step(mx, my);
        (x, y, size)
    }

    fn move_step(&self, x: i32, y: i32) -> (i32, i32) {
        match self.direction_pointer {
            Direction::Left => (x - 1, y),
            Direction::Up => (x, y - 1),
            Direction::Right => (x + 1, y),
            Direction::Down => (x, y + 1),
        }
    }

    // Check if the color at a given position is different
    // than the current color
    fn current_color_eq(&self, x: i32, y: i32) -> bool {
        self.current_color == self.pixel_at(x, y)
    }

    fn pixel_at(&self, x: i32, y: i32) -> &'a colors::Rgba {
        self.image.get_pixel(x as u32, y as u32)
    }

    fn current_color_code(&self) -> i32 {
        match colors::color_code(&self.current_color) {
            Some(color) => color,
            None => 0,
        }
    }

    fn color_at(&self, x: i32, y: i32) -> i32 {
        match colors::color_code(&self.pixel_at(x, y)) {
            Some(color) => color,
            None => 0,
        }
    }

    fn restricted(&self, x: i32, y: i32) -> bool {
        !self.image.in_bounds(x as u32, y as u32) || self.color_at(x, y) == 0
    }

    // block walk should count the size of the current block
    // and set it on the Interpreter
    fn block_walk_recursive(
        &self,
        size: &mut u32,
        x: i32,
        y: i32,
        mx: &mut i32,
        my: &mut i32,
        marked: &mut Vec<bool>,
    ) {
        if self.image.in_bounds(x as u32, y as u32) {
            let visit_index = self.marked_index(x, y) as usize;

            if self.current_color_eq(x, y) && !marked[visit_index] {
                *size += 1;
                marked[visit_index] = true;

                match self.direction_pointer {
                    Direction::Left => {
                        if x < *mx {
                            *mx = x;
                            *my = y;
                        } else if x == *mx {
                            match self.codel_chooser {
                                CodelChooser::Left => {
                                    if y > *my {
                                        *my = y;
                                    }
                                }

                                CodelChooser::Right => {
                                    if y < *my {
                                        *my = y;
                                    }
                                }
                            }
                        }
                    }
                    Direction::Right => {
                        if x > *mx {
                            *mx = x;
                            *my = y;
                        } else if x == *mx {
                            match self.codel_chooser {
                                CodelChooser::Left => {
                                    if y < *my {
                                        *my = y;
                                    }
                                }

                                CodelChooser::Right => {
                                    if y > *my {
                                        *my = y;
                                    }
                                }
                            }
                        }
                    }
                    Direction::Down => {
                        if y > *my {
                            *mx = x;
                            *my = y;
                        } else if y == *my {
                            match self.codel_chooser {
                                CodelChooser::Left => {
                                    if x > *mx {
                                        *mx = x;
                                    }
                                }

                                CodelChooser::Right => {
                                    if x < *mx {
                                        *mx = x;
                                    }
                                }
                            }
                        }
                    }
                    Direction::Up => {
                        if y < *my {
                            *mx = x;
                            *my = y;
                        } else if y == *my {
                            match self.codel_chooser {
                                CodelChooser::Left => {
                                    if x < *mx {
                                        *mx = x;
                                    }
                                }

                                CodelChooser::Right => {
                                    if x > *mx {
                                        *mx = x;
                                    }
                                }
                            }
                        }
                    }
                }

                self.block_walk_recursive(size, x + 1, y, mx, my, marked);
                self.block_walk_recursive(size, x - 1, y, mx, my, marked);
                self.block_walk_recursive(size, x, y + 1, mx, my, marked);
                self.block_walk_recursive(size, x, y - 1, mx, my, marked);
            }
        }
    }

    fn marked_index(&self, x: i32, y: i32) -> i32 {
        y * self.image.width() as i32 + x
    }
}

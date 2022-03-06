mod colors;
mod interpreter;
mod ops;

#[cfg(test)]
mod tests;

use wasm_bindgen::prelude::*;
use web_sys::ImageData;

#[wasm_bindgen]
pub fn piet(program: ImageData, input: &str) -> String {
    let image = interpreter::Image {
        width: program.width(),
        height: program.height(),
        pixels: program.data(),
    };

    run_piet(&image, &input)
}

pub fn run_piet(image: &interpreter::Image, input: &str) -> String {
    let mut interpreter = interpreter::Interpreter::new(&image, input);

    interpreter.run();
    interpreter.output
}

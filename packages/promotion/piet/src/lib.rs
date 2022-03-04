mod colors;
mod interpreter;
mod ops;

use wasm_bindgen::prelude::*;
use web_sys::ImageData;

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub fn piet(program: ImageData, input: &str, output: &str) -> bool {
    let image = interpreter::Image {
        width: program.width(),
        height: program.height(),
        pixels: program.data(),
    };

    run_piet(image, &input, &output)
}

pub fn run_piet(image: interpreter::Image, input: &str, output: &str) -> bool {
    let mut interpreter = interpreter::Interpreter::new(&image, input);

    interpreter.run();
    interpreter.output == output
}

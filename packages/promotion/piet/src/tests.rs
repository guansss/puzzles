use image::EncodableLayout;
use std::path::Path;
use std::path::PathBuf;
use wasm_bindgen::Clamped;

use super::*;

#[test]
fn hello() {
    assert_piet("assets/Piet_hello.png", "", "Hello world!");
}

#[test]
fn adder() {
    // this program deliberately outputs two "n" before the addition result
    assert_piet("assets/adder.png", "55", "nn5+5=10");
}

pub fn assert_piet(file: &str, input: &str, output: &str) {
    let image = read_image(PathBuf::from(env!("CARGO_MANIFEST_DIR")).join(file));

    assert!(
        run_piet(&image, input, output),
        "Expected: {}, Got: {}",
        output,
        run_piet_then_output(&image, input)
    );
}

fn read_image<T: AsRef<Path>>(file: T) -> interpreter::Image {
    let image = image::open(file).unwrap().into_rgba8();

    interpreter::Image {
        width: image.width(),
        height: image.height(),
        pixels: Clamped(image.as_bytes().to_vec()),
    }
}

pub fn run_piet_then_output(image: &interpreter::Image, input: &str) -> String {
    let mut interpreter = interpreter::Interpreter::new(&image, input);

    interpreter.run();
    interpreter.output
}

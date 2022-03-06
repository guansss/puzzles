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
    assert_piet("assets/adder.png", "12", "nn1+2=3");
    assert_piet("assets/adder.png", "55", "nn5+5=10");
}

pub fn assert_piet(file: &str, input: &str, expected_output: &str) {
    let image = read_image(PathBuf::from(env!("CARGO_MANIFEST_DIR")).join(file));
    let output = run_piet(&image, input);

    assert_eq!(expected_output, output);
}

fn read_image<T: AsRef<Path>>(file: T) -> interpreter::Image {
    let image = image::open(file).unwrap().into_rgba8();

    interpreter::Image {
        width: image.width(),
        height: image.height(),
        pixels: Clamped(image.as_bytes().to_vec()),
    }
}

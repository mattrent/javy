use fl_wasm_rs::prelude;
use javy::Runtime;
use once_cell::sync::OnceCell;
use std::io::{self, Read};
use std::slice;
use std::str;
use std::string::String;

mod alloc;
mod execution;
mod runtime;

const FUNCTION_MODULE_NAME: &str = "function.mjs";

static mut RUNTIME: OnceCell<Runtime> = OnceCell::new();
static mut BYTECODE: OnceCell<Vec<u8>> = OnceCell::new();
static mut SCRIPT: OnceCell<String> = OnceCell::new();

#[export_name = "wizer.initialize"]
pub extern "C" fn init() {
    let runtime = runtime::new_runtime().unwrap();

    let mut contents = String::new();
    io::stdin().read_to_string(&mut contents).unwrap();
    let bytecode = runtime
        .context()
        .compile_module("function.mjs", &contents)
        .unwrap();

    unsafe {
        SCRIPT.set(contents).unwrap();
        RUNTIME.set(runtime).unwrap();
        BYTECODE.set(bytecode).unwrap();
    }
}

fn main() {
    let bytecode = unsafe { BYTECODE.take().unwrap() };
    let runtime = unsafe { RUNTIME.take().unwrap() };
    execution::run_bytecode(&runtime, &bytecode);
}

// Removed in post_processing.
/// 1. Allocate memory of new_size with alignment.
/// 2. If original_ptr != 0
///   a. copy min(new_size, original_size) bytes from original_ptr to new memory
///   b. de-allocate original_ptr
/// 3. return new memory ptr
///
/// # Safety
///
/// * `original_ptr` must be 0 or a valid pointer
/// * if `original_ptr` is not 0, it must be valid for reads of `original_size`
///   bytes
/// * if `original_ptr` is not 0, it must be properly aligned
/// * if `original_size` is not 0, it must match the `new_size` value provided
///   in the original `canonical_abi_realloc` call that returned `original_ptr`
#[export_name = "canonical_abi_realloc"]
pub unsafe extern "C" fn canonical_abi_realloc(
    original_ptr: *mut u8,
    original_size: usize,
    alignment: usize,
    new_size: usize,
) -> *mut std::ffi::c_void {
    alloc::canonical_abi_realloc(original_ptr, original_size, alignment, new_size)
}

// Removed in post-processing.
/// Evaluates QuickJS bytecode and invokes the exported JS function name.
///
/// # Safety
///
/// * `fn_name_ptr` must reference a UTF-8 string with `fn_name_size` byte
///   length.
#[export_name = "javy.invoke"]
pub unsafe extern "C" fn invoke(fn_name_ptr: *mut u8, fn_name_size: usize) {
    let js_fn_name = str::from_utf8_unchecked(slice::from_raw_parts(fn_name_ptr, fn_name_size));
    let runtime = unsafe { RUNTIME.take().unwrap() };
    execution::invoke_function(&runtime, FUNCTION_MODULE_NAME, js_fn_name);
}

#[no_mangle]
#[export_name = "__invoke"]
#[cfg(target_arch = "wasm32")]
pub extern "C" fn __invoke(req_len: i32) -> i32 {
    let runtime = unsafe { RUNTIME.take().unwrap() };
    let script = unsafe { SCRIPT.take().unwrap() };
    let fn_name = "fl_main";

    let context = runtime.context();

    let _ = context.eval_global("function.mjs", &script).unwrap();
    let global = context.global_object().unwrap();
    let fun = global.get_property(fn_name).unwrap();

    if !fun.is_null_or_undefined() || !fun.is_function() {
        let input_data = prelude::get_input_data(req_len);
        let input_string = match str::from_utf8(&input_data) {
            Ok(v) => String::from(v),
            Err(e) => panic!("Invalid UTF-8 sequence in input: {}", e),
        };
        let js_input = javy::json::transcode_input(context, input_string.as_bytes()).unwrap();

        let source = script + include_str!("./wrap.js");
        let _ = context.eval_global("run.mjs", &source);
        let global = context.global_object().unwrap();
        let runner = global.get_property("__fl_main_run").unwrap();

        let result = runner
            .call(&global, &[js_input])
            .and_then(|_| context.execute_pending());

        let global = context.global_object().unwrap();

        match result {
            Ok(()) => {
                let return_value = global.get_property("__fl_global_return_value").unwrap();
                let error_value = global.get_property("__fl_global_error_value").unwrap();

                if error_value.is_null_or_undefined() {
                    let transcoded = javy::json::transcode_output(return_value).unwrap();
                    let resp = str::from_utf8(&transcoded).unwrap();
                    prelude::insert_response(resp);
                    0
                } else {
                    let transcoded = javy::json::transcode_output(error_value).unwrap();
                    let errmsg = str::from_utf8(&transcoded).unwrap();
                    prelude::insert_error(errmsg);
                    1
                }
            }
            Err(e) => {
                let errmsg = e.to_string();
                prelude::insert_error(&errmsg);
                1
            }
        }
    } else {
        prelude::insert_error("function fl_main was not defined");
        1
    }
}

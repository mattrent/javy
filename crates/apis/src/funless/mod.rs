use core::time;
use std::{
    collections::HashMap,
    thread,
};

use anyhow::Result;
use fl_wasm_rs::prelude;
use javy::{
    quickjs::{JSValue},
    Runtime,
};

use crate::{APIConfig, JSApiSet};

pub(super) struct Funless;

impl JSApiSet for Funless {
    fn register(&self, runtime: &Runtime, _config: &APIConfig) -> Result<()> {
        let context = runtime.context();
        let global = context.global_object()?;

        let mut fl_object = global.get_property("FL")?;
        if fl_object.is_undefined() {
            fl_object = context.object_value()?;
            global.set_property("FL", fl_object)?;
        }

        global.set_property(
            "__fl_console_log",
            context.wrap_callback(|_, _this_arg, args| {
                let [_data, ..] = args else {
                    anyhow::bail!("Invalid number of parameters");
                };

                let data: String = _data.try_into()?;
                prelude::console_log(&data);
                Ok(JSValue::String(data))
            })?,
        )?;

        global.set_property(
            "__fl_http_request",
            context.wrap_callback(|_, _this_arg, args| {
                let [_method, _uri, _headers, _body, ..] = args else {
                    anyhow::bail!("Invalid number of parameters");
                };

                let method: String = _method.try_into()?;
                let uri: String = _uri.try_into()?;
                let body: String = _body.try_into()?;

                let headers_map: HashMap<String, JSValue> = _headers.try_into()?;
                let headers = headers_map
                    .iter()
                    .map(|(k, v)| (k.to_string(), v.to_string()));

                let _request = prelude::FLRequest::new()
                    .with_method(method)
                    .with_uri(uri)
                    .with_body(body);

                let request = headers.fold(_request, |req, (k, v)| req.with_header(k, v));

                let response = request.send();

                Ok(JSValue::String(response.body))
            })?,
        )?;

        global.set_property(
            "__fl_sleep",
            context.wrap_callback(|_, _this_arg, args| {
                let [_timer, ..] = args else {
                    anyhow::bail!("Invalid number of parameters");
                };

                if _timer.is_repr_as_i32() {
                    if _timer.as_i32_unchecked() < 0 {
                        anyhow::bail!("Timeout timer must be positive");
                    }
                    let _timer_u64: u64 = _timer.as_i32_unchecked().try_into().unwrap();

                    thread::sleep(time::Duration::from_millis(u64::from(_timer_u64)));
                } else {
                    anyhow::bail!("Timeout timer must be an integer")
                }

                Ok(JSValue::Undefined)
            })?,
        )?;

        context.eval_global("fl.js", include_str!("./fl.js"))?;
        Ok(())
    }
}

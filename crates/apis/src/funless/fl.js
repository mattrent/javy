(function () {
    const __fl_console_log = globalThis.__fl_console_log;
    const __fl_http_request = globalThis.__fl_http_request;
    const __fl_sleep = globalThis.__fl_sleep;

    globalThis.FL = {
        HTTP: {
            get(uri, headers) {
                if (headers.constructor != Object) {
                    throw TypeError("Headers must be an Object");
                }
                return __fl_http_request("GET", uri, headers, "")
            },
            post(uri, headers, body) {
                if (headers.constructor != Object || body.constructor != Object) {
                    throw TypeError("Headers and body must be Objects");
                }
                let bodyString = JSON.stringify(body)
                return __fl_http_request("POST", uri, headers, bodyString)
            },
            put(uri, headers, body) {
                if (headers.constructor != Object || body.constructor != Object) {
                    throw TypeError("Headers and body must be Objects");
                }
                let bodyString = JSON.stringify(body)
                return __fl_http_request("PUT", uri, headers, bodyString)
            },
            delete(uri, headers) {
                if (headers.constructor != Object) {
                    throw TypeError("Headers must be an Object");
                }
                return __fl_http_request("DELETE", uri, headers, "")
            }
        },
        NATIVE: {
            consoleLog(data) {
                return __fl_console_log(data)
            }
        }
    };

    globalThis.setTimeout = (fn, timer) => {
        let p = new Promise(resolve => {
            __fl_sleep(timer);
            fn();
            resolve();
        })
    }

    Reflect.deleteProperty(globalThis, "__fl_console_log");
    Reflect.deleteProperty(globalThis, "__fl_http_request");
    Reflect.deleteProperty(globalThis, "__fl_sleep");
})();
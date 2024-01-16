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
                let bodyString = ""
                if (body.constructor != String) {
                    if (body.constructor == Object) {
                        bodyString = JSON.stringify(body)
                    } else {
                        throw TypeError("Body must be either Object or String")
                    }
                } else {
                    bodyString = body
                }
                if (headers.constructor != Object) {
                    throw TypeError("Headers must be an Object");
                }
                return __fl_http_request("POST", uri, headers, bodyString)
            },
            put(uri, headers, body) {
                let bodyString = ""
                if (body.constructor != String) {
                    if (body.constructor == Object) {
                        bodyString = JSON.stringify(body)
                    } else {
                        throw TypeError("Body must be either Object or String")
                    }
                } else {
                    bodyString = body
                }
                if (headers.constructor != Object) {
                    throw TypeError("Headers must be an Object");
                }
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
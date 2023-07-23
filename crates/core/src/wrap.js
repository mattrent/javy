async function __fl_main_run(params) {
    try {
        let payload = await Promise.resolve(fl_main(params))
        globalThis.__fl_global_return_value = payload
    } catch (error) {
        globalThis.__fl_global_error_value = error
    }
}
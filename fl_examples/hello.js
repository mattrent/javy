function fl_main(data) {
    let name = data.name || "World"
    return { "payload": `Hello, ${name}!` }
}
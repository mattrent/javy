function hello(data) {
    let name = data.name || "World"
    return { "payload": `Hello, ${name}!` }
}

async function fl_main(data) {
    await FL.run(hello, data)
}
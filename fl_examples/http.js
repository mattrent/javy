function req(data) {
    let get_response = FL.HTTP.get("https://dummyjson.com/products/1", { "Content-Type": "application/json" })
    let get = JSON.parse(get_response)

    let post_response = FL.HTTP.post("https://dummyjson.com/products/add",
        { "Content-Type": "application/json" }, { "title": "FLFLPOST" })
    let post = JSON.parse(post_response)

    let put_response = FL.HTTP.put("https://dummyjson.com/products/1",
        { "Content-Type": "application/json" }, { "title": "FLFLPUT" })
    let put = JSON.parse(put_response)

    let delete_response = FL.HTTP.delete("https://dummyjson.com/products/1", { "Content-Type": "application/json" })
    let del = JSON.parse(delete_response)

    return { "get": get, "post": post, "put": put, "delete": del }
}

async function fl_main(data) {
    await FL.run(req, data)
}
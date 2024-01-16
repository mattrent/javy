function fl_main(data) {
    let url = data.url
    let get_response = FL.HTTP.get(url, { "Content-Type": "application/json" })
    let response = JSON.parse(get_response)
    return { "response": response }
}
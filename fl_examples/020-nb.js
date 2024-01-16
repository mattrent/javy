function fl_main(data) {
    let url = data.url
    let request_id = data["request-id"]
    let repetitions = data.repetitions
    let bucket = data.bucket
    let auth = data.auth

    let i = 0
    let failures = 0
    let results = []

    for (i = 0; i < repetitions; i++) {
        let begin = Date.now()
        let _res = FL.HTTP.get(url, { "Content-Type": "application/json" })
        let end = Date.now()
        results.push(`${i},${begin},${end}`)
        if ((end - begin) > 4000) {
            failures++
        }
        if (failures >= 5) {
            throw "timeout in http requests"
        }
    }

    let results_str = "id,client_send,client_recv\n"
    results.forEach(res => {
        if (res != "") {
            results_str += res
            results_str += "\n"
        }
    });

    let bucket_resp = ""
    let file_name = ""
    if (failures < 5) {
        file_name = `020-sebs-fl-js-${request_id}.csv`
        let auth_token = `Bearer ${auth}`
        let bucket_url = `${bucket}/o?name=${file_name}`
        bucket_resp = FL.HTTP.post(bucket_url, { "Authorization": auth_token }, results_str)
    }

    return {
        "bucket_resp": bucket_resp,
        "key": file_name,
        "failures": failures,
        "request-id": request_id
    }
}
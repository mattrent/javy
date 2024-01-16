function fl_main(data) {
    let url = data.url
    let request_id = data["request-id"]
    let repetitions = data.repetitions
    let bucket = data.bucket
    let auth = data.auth

    let i = 0
    let failures = 0
    let results = []
    let min_latency = 0
    let not_smaller = 0

    for (i = 0; i < 1000; i++) {
        let begin = Date.now()
        let _res = FL.HTTP.get(url, { "Content-Type": "application/json" })
        let end = Date.now()
        let cur_latency = end - begin
        results.push(`${i},${begin},${end}`)
        if ((end - begin) > 4000) {
            failures++
        }

        if (failures >= 7) {
            throw "timeout in http requests"
        }

        if (cur_latency > min_latency && min_latency > 0) {
            not_smaller += 1
            if (not_smaller == repetitions) {
                break
            }
        } else {
            min_latency = cur_latency
            not_smaller = 0
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
    if (failures < 7) {
        file_name = `030-sebs-fl-js-${request_id}.csv`
        let auth_token = `Bearer ${auth}`
        let bucket_url = `${bucket}/o?name=${file_name}`
        bucket_resp = FL.HTTP.post(bucket_url, { "Authorization": auth_token }, results_str)
    }

    return {
        "key": file_name,
        "failures": failures,
        "bucket_resp": bucket_resp,
        "request-id": request_id,
        "i": i,
        "min_latency": min_latency
    }
}
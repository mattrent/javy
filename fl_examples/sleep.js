function sleep(params) {
    let ms = params.duration || 1000;
    return new Promise(resolve => {
        setTimeout(
            () => {
                resolve(
                    {
                        'payload': `Slept for ${ms}`
                    }
                )
            },
            ms)
    })
}

async function fl_main(params) {
    await FL.run(sleep, params);
}


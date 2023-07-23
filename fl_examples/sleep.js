function fl_main(params) {
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

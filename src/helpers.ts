export var round = (N,acc = 100000) => {
    return Math.round(N * acc) / acc
}
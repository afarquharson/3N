var Config = (function () {
    function Config() {
    }
    return Config;
})();
//http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range 9-01-2016
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

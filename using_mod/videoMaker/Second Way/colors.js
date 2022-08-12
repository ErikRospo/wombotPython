function printRed(text) {
    console.log(`\x1b[31m${text}\x1b[0m`);
}
function printGreen(text) {
    console.log(`\x1b[32m${text}\x1b[0m`);
}
function printYellow(text) {
    console.log(`\x1b[33m${text}\x1b[0m`);
}
function printBlue(text) {
    console.log(`\x1b[34m${text}\x1b[0m`);
}
function printMagenta(text) {
    console.log(`\x1b[35m${text}\x1b[0m`);
}
function printCyan(text) {
    console.log(`\x1b[36m${text}\x1b[0m`);
}
function printWhite(text) {
    console.log(`\x1b[37m${text}\x1b[0m`);
}
function printGrey(text) {
    console.log(`\x1b[90m${text}\x1b[0m`);
}
function printBlack(text) {
    console.log(`\x1b[30m${text}\x1b[0m`);
}
function printRedBG(text) {
    console.log(`\x1b[41m${text}\x1b[0m`);
}
function printGreenBG(text) {
    console.log(`\x1b[42m${text}\x1b[0m`);
}
function printYellowBG(text) {
    console.log(`\x1b[43m${text}\x1b[0m`);
}
function printAlert(text) {
    console.log(`\x1b[41m\x1b[33m${text}\x1b[0m`);
}
function reset() {
    console.log("\x1b[0m");
}

module.exports={
    printRed,
    printGreen,
    printYellow,
    printBlue,
    printMagenta,
    printCyan,
    printWhite,
    printGrey,
    printBlack,
    printRedBG,
    printGreenBG,
    printYellowBG,
    reset,
    printAlert
};
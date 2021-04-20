"use strict";
exports.__esModule = true;
function leadingZero(num) {
    return ("" + num).length === 1 ? "0" + ("" + num) : "" + num;
}
exports["default"] = leadingZero;

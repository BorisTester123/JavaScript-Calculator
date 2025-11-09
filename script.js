let display = document.querySelector(".display");
let buttons = Array.from(document.querySelectorAll(".button"));
let isResult = false;
const MAX_DIGITS = 12;

function adjustFontSize() {
  display.style.fontSize = "70px";
  let fontSize = 70;
  while (display.scrollWidth > display.clientWidth && fontSize > 10) {
    fontSize -= 1;
    display.style.fontSize = fontSize + "px";
  }
}

function toScientificInteger(numStr, precision = 10) {
  if (numStr.length <= MAX_DIGITS) return numStr;
  let sign = numStr.startsWith("-") ? "-" : "";
  numStr = numStr.replace(/^-/, "");
  if (numStr === "0") return "0";
  let exp = numStr.length - 1;
  let mantissa = numStr[0] + "." + numStr.slice(1, precision + 1);
  return sign + parseFloat(mantissa).toFixed(precision) + "e+" + exp;
}

function getLastOperandInfo(str) {
  let lastMatch = str.match(/[-]?\d*\.?\d*$/);
  if (!lastMatch) {
    return null;
  }
  let operand = lastMatch[0];
  let startPos = lastMatch.index;
  let before = str.substring(0, startPos);
  return { before, operand };
}

buttons.map((button) => {
  button.addEventListener("click", (e) => {
    let char = e.target.innerText;
    let str = display.innerText;
    let opRegex = /[\+\-\*\/](?=[^\+\-\*\/]*$)/;

    switch (char) {
      case "AC":
        display.innerText = "0";
        isResult = false;
        break;
      case "=":
        try {
          let evalStr = str.replace(/([+\-*\/]|^)(\.)/g, "$10.");
          evalStr = evalStr.replace(/\.$/, "");
          let hasDecimal = evalStr.includes(".");
          let hasDivision = evalStr.includes("/");
          let result;
          if (!hasDecimal && !hasDivision) {
            let spacedStr = evalStr.replace(/([+\-*\/])/g, " $1 ");
            let bigExpr = spacedStr.replace(/(\b\d+\b)/g, "$1n");
            result = eval(bigExpr);
            result = result.toString();
            if (result.length > MAX_DIGITS) {
              result = toScientificInteger(result);
            }
          } else {
            result = eval(evalStr);
            let resultStr = result.toString();
            if (
              resultStr.length > MAX_DIGITS &&
              !resultStr.includes("e") &&
              !resultStr.includes("E")
            ) {
              result = result.toExponential(10);
            } else {
              result = resultStr;
            }
          }
          if (
            result === "Infinity" ||
            result === "-Infinity" ||
            result === "NaN" ||
            isNaN(parseFloat(result))
          ) {
            throw new Error("Invalid operation");
          }
          display.innerText = result;
        } catch (err) {
          display.innerText = "Error!";
        }
        isResult = true;
        break;
      case "+/-":
        if (str === "Error!") {
          display.innerText = "0";
          break;
        }
        let info = getLastOperandInfo(str);
        if (!info) {
          break;
        }
        let { before, operand } = info;
        let newOperand;
        if (operand === "") {
          if (before.endsWith("-")) {
            display.innerText = before.slice(0, -1);
          } else {
            display.innerText = before + "-";
          }
        } else {
          if (operand.startsWith("-")) {
            newOperand = operand.substring(1);
          } else {
            newOperand = "-" + operand;
          }
          display.innerText = before + newOperand;
        }
        isResult = false;
        break;
      case "%":
        try {
          let matchPercent = str.match(opRegex);
          if (matchPercent) {
            let opPosPercent = matchPercent.index;
            let op = matchPercent[0];
            let leftStr = str.substring(0, opPosPercent);
            let rightStr = str.substring(opPosPercent + 1);
            if (rightStr === "") {
              return;
            }
            let evalLeft = leftStr
              .replace(/([+\-*\/]|^)(\.)/g, "$10.")
              .replace(/\.$/, "");
            let evalRight = rightStr
              .replace(/([+\-*\/]|^)(\.)/g, "$10.")
              .replace(/\.$/, "");
            let left = eval(evalLeft);
            let right = eval(evalRight);
            if (isNaN(left) || isNaN(right)) {
              throw new Error("Invalid percent");
            }
            let percentValue =
              op === "+" || op === "-" ? (left * right) / 100 : right / 100;
            let newExpr = left + op + percentValue;
            let finalResult = eval(newExpr);
            let finalResultStr = finalResult.toString();
            if (
              finalResultStr.length > MAX_DIGITS &&
              !finalResultStr.includes("e") &&
              !finalResultStr.includes("E")
            ) {
              finalResult = finalResult.toExponential(10);
            } else {
              finalResult = finalResultStr;
            }
            if (
              finalResult === "Infinity" ||
              finalResult === "-Infinity" ||
              finalResult === "NaN" ||
              isNaN(parseFloat(finalResult))
            ) {
              throw new Error("Invalid operation");
            }
            display.innerText = finalResult;
          } else {
            let evalStrPercent = str
              .replace(/([+\-*\/]|^)(\.)/g, "$10.")
              .replace(/\.$/, "");
            let value = eval(evalStrPercent);
            if (isNaN(value)) {
              throw new Error("Invalid percent");
            }
            let percentResult = value / 100;
            let percentResultStr = percentResult.toString();
            if (
              percentResultStr.length > MAX_DIGITS &&
              !percentResultStr.includes("e") &&
              !percentResultStr.includes("E")
            ) {
              percentResult = percentResult.toExponential(10);
            }
            display.innerText = percentResult;
          }
        } catch (err) {
          display.innerText = "Error!";
        }
        isResult = true;
        break;
      default:
        let isOperator = ["+", "-", "*", "/"].includes(char);
        if (str === "Error!" && !isOperator) {
          display.innerText = char;
          isResult = false;
          adjustFontSize();
          return;
        }
        if (char === ".") {
          let lastMatch = str.match(/[-]?\d*\.?\d*$/);
          if (!lastMatch) {
            return;
          }
          let lastOperandDot = lastMatch[0];
          if (lastOperandDot.includes(".")) return;
          display.innerText += ".";
          isResult = false;
          adjustFontSize();
          return;
        }
        if (isOperator) {
          if (isResult) {
            isResult = false;
          }
          let lastChar = str.slice(-1);
          if (["+", "-", "*", "/"].includes(lastChar)) {
            display.innerText = str.slice(0, -1) + char;
          } else if (str !== "0") {
            display.innerText += char;
          }
        } else {
          if (str === "0" || isResult || str === "Error!") {
            display.innerText = char;
            isResult = false;
          } else {
            let info = getLastOperandInfo(str);
            if (!info) {
              return;
            }
            let { before, operand } = info;
            let digitCount = operand.replace(/[^0-9]/g, "").length;
            if (digitCount >= MAX_DIGITS) return;
            if (operand === "0" || operand === "-0") {
              let sign = operand.startsWith("-") ? "-" : "";
              display.innerText = before + sign + char;
            } else {
              display.innerText += char;
            }
          }
        }
    }
    adjustFontSize();
  });
});

adjustFontSize();

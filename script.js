let display = document.querySelector(".display");
let buttons = Array.from(document.querySelectorAll(".button"));
let isResult = false;

function adjustFontSize() {
  display.style.fontSize = "70px"; // Сброс
  let fontSize = 70;
  while (display.scrollWidth > display.clientWidth && fontSize > 10) {
    fontSize -= 1;
    display.style.fontSize = fontSize + "px";
  }
}

buttons.map((button) => {
  button.addEventListener("click", (e) => {
    let char = e.target.innerText;
    let str = display.innerText;
    let opRegex = /[\+\-\*\/](?=[^\+\-\*\/]*$)/; // Объявляем здесь, чтобы была доступна везде

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
          } else {
            result = eval(evalStr);
            result = result.toString();
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
        if (str === "0" || str === "Error!") {
          display.innerText = "0";
          break;
        }
        let match = str.match(opRegex);
        let opPos = match ? match.index : 0;
        let before = str.substring(0, opPos + 1);
        let lastOperand = str.substring(opPos + 1);
        if (lastOperand === "" && !before.endsWith("-")) {
          display.innerText = before + "-";
        } else if (lastOperand.startsWith("-")) {
          lastOperand = lastOperand.substring(1);
          display.innerText = before + lastOperand;
        } else {
          lastOperand = "-" + lastOperand;
          display.innerText = before + lastOperand;
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
            let finalResult = eval(newExpr).toString();
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
            display.innerText = (value / 100).toString();
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
          let matchDot = str.match(opRegex);
          let opPosDot = matchDot ? matchDot.index : 0;
          let lastOperandDot = str.substring(opPosDot + 1);
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
            if (str.length >= 100) return;
            display.innerText += char;
          }
        }
    }
    adjustFontSize();
  });
});

adjustFontSize();

import React, {useState} from "react";
import {saveCalculation} from "../../utils/saveCalculation";
import ButtonRow from "./ButtonRow/ButtonRow";
import {Timestamp} from "firebase/firestore";
import Display from "./Display/Display";
import {Styles } from './styles';
import {View} from "react-native";

export default function Keyboard() {
  const [firstNumber, setFirstNumber] = useState<string>("");
  const [secondNumber, setSecondNumber] = useState<string>("");
  const [operation, setOperation] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);

  const handleNumberPress = (buttonValue: string) => {
    if (firstNumber.length < 10) {
      setFirstNumber((prev) => prev + buttonValue);
    }
  };

  const handleOperationPress = (buttonValue: string) => {
    if (buttonValue === "+/-") {
      toggleSign();
    } else if (buttonValue === "％") {
      calculatePercentage();
    } else {
      if (result !== null) {
        setSecondNumber(result.toString());
        setResult(null);
      } else if (operation && firstNumber !== "") {
        getResult();
      } else {
        setSecondNumber(firstNumber);
      }
      setOperation(buttonValue);
      setFirstNumber("");
    }
  };

  const toggleSign = () => {
    if (firstNumber.startsWith("-")) {
      setFirstNumber(firstNumber.substring(1));
    } else {
      setFirstNumber("-" + firstNumber);
    }
  };

  const calculatePercentage = () => {
    const num = parseFloat(firstNumber);
    if (!isNaN(num)) {
      setFirstNumber((num / 100).toString());
    }
  };

  const clear = () => {
    setFirstNumber("");
    setSecondNumber("");
    setOperation("");
    setResult(null);
  };

  const getResult = async () => {
    const num1 = parseFloat(secondNumber);
    const num2 = parseFloat(firstNumber);

    if (isNaN(num1) || isNaN(num2)) {
      clear();
      return;
    }

    let computedResult: number = 0;

    switch (operation) {
      case "+":
        computedResult = num1 + num2;
        break;
      case "-":
        computedResult = num1 - num2;
        break;
      case "*":
        computedResult = num1 * num2;
        break;
      case "/":
        if (num2 === 0) {
          clear();
          return;
        }
        computedResult = num1 / num2;
        break;
      default:
        clear();
        return;
    }

    setFirstNumber(computedResult.toString());
    setSecondNumber("");
    setOperation("");
    setResult(null);

    const calculation = {
      firstNumber: num1.toString(),
      secondNumber: num2.toString(),
      operation: operation,
      result: computedResult,
      timestamp: Timestamp.now(),
    };

    await saveCalculation(calculation);
  };

  return (
    <View style={Styles.container}>
      <Display
        firstNumber={firstNumber}
        secondNumber={secondNumber}
        operation={operation}
        result={result}
      />
      <ButtonRow
        buttons={[
          { title: "C", isBlue: false, onPress: clear },
          { title: "+/-", isBlue: false, onPress: () => handleOperationPress("+/-") },
          { title: "％", isBlue: false, onPress: () => handleOperationPress("％") },
          { title: "÷", isBlue: true, onPress: () => handleOperationPress("/") },
        ]}
      />
      <ButtonRow
        buttons={[
          { title: "7", onPress: () => handleNumberPress("7") },
          { title: "8", onPress: () => handleNumberPress("8") },
          { title: "9", onPress: () => handleNumberPress("9") },
          { title: "×", isBlue: true, onPress: () => handleOperationPress("*") },
        ]}
      />
      <ButtonRow
        buttons={[
          { title: "4", onPress: () => handleNumberPress("4") },
          { title: "5", onPress: () => handleNumberPress("5") },
          { title: "6", onPress: () => handleNumberPress("6") },
          { title: "-", isBlue: true, onPress: () => handleOperationPress("-") },
        ]}
      />
      <ButtonRow
        buttons={[
          { title: "1", onPress: () => handleNumberPress("1") },
          { title: "2", onPress: () => handleNumberPress("2") },
          { title: "3", onPress: () => handleNumberPress("3") },
          { title: "+", isBlue: true, onPress: () => handleOperationPress("+") },
        ]}
      />
      <ButtonRow
        buttons={[
          { title: ".", onPress: () => handleNumberPress(".") },
          { title: "0", onPress: () => handleNumberPress("0") },
          { title: "⌫", onPress: () => setFirstNumber(firstNumber.slice(0, -1)) },
          { title: "=", isBlue: true, onPress: getResult },
        ]}
      />
    </View>
  );
}
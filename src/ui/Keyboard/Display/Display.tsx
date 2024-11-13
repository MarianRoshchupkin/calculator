import React from "react";
import {View} from "react-native";
import SecondNumberDisplay from "../SecondNumberDisplay/SecondNumberDisplay";
import FirstNumberDisplay from "../FirstNumberDisplay/FirstNumberDisplay";

type TProps = {
  firstNumber: string;
  secondNumber: string;
  operation: string;
  result: number | null;
}

export default function Display({ firstNumber, secondNumber, operation, result }: TProps) {
  return (
    <View
      style={{
        height: 120,
        width: "90%",
        justifyContent: "flex-end",
        alignSelf: "center",
      }}
    >
      <SecondNumberDisplay secondNumber={secondNumber} operation={operation} />
      <FirstNumberDisplay firstNumber={firstNumber} result={result} />
    </View>
  );
};
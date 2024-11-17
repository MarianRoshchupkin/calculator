import React from "react";
import {Text} from "react-native";
import {Styles} from './styles';

type TProps = {
  secondNumber: string;
  operation: string;
};

export default function SecondNumberDisplay({ secondNumber, operation }: TProps) {
  if (!secondNumber && !operation) {
    return null;
  }

  return (
    <Text style={Styles.screenSecondNumber}>
      {secondNumber} {operation}
    </Text>
  );
}
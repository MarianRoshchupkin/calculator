import React from "react";
import {Text} from "react-native";
import {colors} from "../../../../global.styles";
import {Styles} from './styles';

type TProps = {
  firstNumber: string;
  result: number | null;
};

export default function FirstNumberDisplay({ firstNumber, result }: TProps) {
  const displayValue = result !== null ? result.toString() : firstNumber || "0";

  return (
    <Text
      style={[
        Styles.screenFirstNumber,
        {
          color: result !== null ? colors.result : colors.white,
          fontSize: displayValue.length > 8 ? 50 : 70,
        },
      ]}
      numberOfLines={1}
      adjustsFontSizeToFit
    >
      {displayValue}
    </Text>
  );
}
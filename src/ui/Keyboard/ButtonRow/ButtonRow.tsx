import React from "react";
import {Styles} from "./styles";
import {View} from "react-native";
import Button from "../../Button/Button";
import {generateRandomString} from "../../../utils/generateRandomString";

type TButton = {
  title: string;
  isBlue?: boolean;
  onPress: () => void;
}

type TProps = {
  buttons: TButton[];
}

export default function ButtonRow({ buttons }: TProps) {
  return (
    <View style={Styles.row}>
      {buttons.map((button) => (
        <Button
          title={button.title}
          isBlue={button.isBlue}
          onPress={button.onPress}
          key={generateRandomString()}
        />
      ))}
    </View>
  );
};
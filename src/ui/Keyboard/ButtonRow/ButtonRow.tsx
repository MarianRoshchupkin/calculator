import React from "react";
import {View} from "react-native";
import {TButton} from "../../../types/types/TButton.type";
import Button from "../../Button/Button";
import {Styles} from "./styles";

type TProps = {
  buttons: TButton[];
};

export default function ButtonRow({ buttons }: TProps) {
  return (
    <View style={Styles.row}>
      {buttons.map((button) => (
        <Button
          title={button.title}
          isBlue={button.isBlue}
          onPress={button.onPress}
          key={button.title} // Use a stable key
        />
      ))}
    </View>
  );
}
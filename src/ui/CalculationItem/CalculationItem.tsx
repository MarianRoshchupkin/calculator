import React, {useEffect, useState} from 'react';
import {TCalculationList} from "../../types/types/TCalculationList.type";
import {View, Text} from 'react-native';
import {Styles} from "./styles";

type TProps = {
  item: TCalculationList;
}

export default function CalculationItem({ item }: TProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <View style={Styles.item}>
      <Text style={Styles.text}>
        {item.firstNumber} {item.operation} {item.secondNumber} = {item.result}
      </Text>
      <Text style={Styles.timestamp}>
        {item.timestamp.toDate().toLocaleString()}
      </Text>
    </View>
  );
};

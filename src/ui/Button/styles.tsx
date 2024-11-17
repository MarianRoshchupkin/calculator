import {StyleSheet} from 'react-native';
import {colors} from "../../../global.styles";

export const Styles = StyleSheet.create({
  button: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
    borderRadius: 24,
    width: 72,
    height: 72,
  },
  buttonBlue: {
    backgroundColor: colors.blue,
  },
  buttonGray: {
    backgroundColor: colors.btnGray,
  },
  smallText: {
    fontSize: 32,
    color: colors.black,
  },
  buttonText: {
    fontSize: 24,
    color: '#fff',
  },
});
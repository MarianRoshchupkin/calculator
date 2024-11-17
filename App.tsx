import {SafeAreaView, View} from 'react-native';
import CalculationsList from "./src/ui/CalculationsList/CalculationsList";
import Keyboard from './src/ui/Keyboard/Keyboard';
import {Styles} from "./global.styles";

export default function App() {
  return (
    <SafeAreaView style={Styles.container}>
      <View>
        <CalculationsList />
      </View>
      <Keyboard />
    </SafeAreaView>
  );
}
import {SafeAreaView} from 'react-native';
import {Styles} from "./global.styles";
import Keyboard from './src/ui/Keyboard/Keyboard';

export default function App() {
  return (
      <SafeAreaView style={Styles.container}>
        <Keyboard />
      </SafeAreaView>
  );
}
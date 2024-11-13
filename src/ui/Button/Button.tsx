import {TouchableOpacity, Text} from 'react-native';
import {Styles} from './styles';

type TProps = {
  title: string;
  isBlue?: boolean;
  onPress: () => void;
}

export default function Button({ title, isBlue, onPress }: TProps) {
  return (
    <TouchableOpacity
      style={[
        Styles.button,
        isBlue ? Styles.buttonBlue : Styles.buttonGray
      ]}
      onPress={onPress}
    >
      <Text style={Styles.smallText}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
import {StyleSheet} from "react-native";

export const colors = {
  light:   '#F1F2F3',
  dark:    '#17171C',
  blue:    '#4B5EFC',
  btnGray: '#4E505F',
  btnDark: '#2E2F38',
  gray:    '#747477',
  black:   '#000000',
  white:   '#FFFFFF',
  result:  '#46D5B2',
};

export const Styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#000000'
  },
  historyButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#1E90FF',
    padding: 10,
    borderRadius: 5,
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '70%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  closeButtonText: {
    color: '#1E90FF',
    fontSize: 16,
  },
  clearButton: {
    alignSelf: 'center',
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
  }
})
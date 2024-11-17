import {Timestamp} from "firebase/firestore";

export type TCalculationKeyboard = {
  firstNumber: string;
  secondNumber: string;
  operation: string;
  result: number;
  timestamp: Timestamp;
};
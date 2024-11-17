import {TCalculationKeyboard} from "../types/types/TCalculationKeyboard.type";
import {collection, addDoc} from "firebase/firestore";
import {db} from "../../firebase.config";

export const saveCalculation = async (calculation: TCalculationKeyboard) => {
  try {
    const calculationsCollection = collection(db, "calculations");
    await addDoc(calculationsCollection, calculation);
  } catch (error) {
    console.error("Error saving calculation: ", error);
  }
}
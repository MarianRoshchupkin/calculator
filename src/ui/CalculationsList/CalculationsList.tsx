import React, {useEffect, useState} from "react";
import {FlatList } from "react-native";
import {collection, query, orderBy, onSnapshot} from "firebase/firestore";
import {TCalculationList} from "../../types/types/TCalculationList.type";
import CalculationItem from "../CalculationItem/CalculationItem";
import {db} from "../../../firebase.config";
import {Styles} from "./styles";

export default function CalculationsList() {
  const [calculations, setCalculations] = useState<TCalculationList[]>([]);

  useEffect(() => {
    const q = query(collection(db, "calculations"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const calculationsData: TCalculationList[] = [];

      querySnapshot.forEach((doc) => {
        calculationsData.push({ id: doc.id, ...doc.data() } as TCalculationList);
      });

      setCalculations(calculationsData);
    });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }: { item: TCalculationList }) => (
    <CalculationItem item={item} />
  );

  return (
    <FlatList
      data={calculations}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={Styles.list}
      initialNumToRender={1}
      maxToRenderPerBatch={1}
      windowSize={5}
    />
  );
}
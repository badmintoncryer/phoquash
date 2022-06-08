import { TravelRecord, getTravelRecord } from "api/backendApi";
import { useIdToken } from "hooks/useIdToken";
import { useState, useEffect } from "react";

type UseTravelListReturn = {
  travelList: TravelRecord[];
  setTravelList: React.Dispatch<React.SetStateAction<TravelRecord[]>>;
};

/**
 * travelRecordの一覧を取得するフック
 *
 * @return {UseTravelListReturn}
 */
export const useTravelList = (): UseTravelListReturn => {
  const [travelList, setTravelList] = useState<TravelRecord[]>([]);
  const { idToken } = useIdToken();
  useEffect(() => {
    const fetchTravelRecord = async () => {
      const travelRecord = await getTravelRecord({ idToken: idToken }).catch(
        (error) => {
          console.log({ error });
          throw new Error("getTravelRecord is failed");
        }
      );
      setTravelList(travelRecord);
    };

    if (!idToken) {
      return;
    }
    fetchTravelRecord();
  }, [idToken]);

  return { travelList: travelList, setTravelList: setTravelList };
};

import axios from "axios";

const BACKEND_API_ROOT_URL = "http://localhost:8080/api/";
const TRAVEL_RECORD_API_URL = BACKEND_API_ROOT_URL + "travelRecord/user/";

export type TravelRecord = {
  title: string;
  start: Date;
  end: Date;
};

export type GetTravelRecordProps = {
  idToken: string;
};

export const getTravelRecord = async (
  props: GetTravelRecordProps
): Promise<TravelRecord[]> => {
  if (!props.idToken) {
    throw new Error("idToken is null");
  }

  // const response = await axios
  //   .get(`${TRAVEL_RECORD_API_URL}`, {
  //     headers: {
  //       Authorization: `Bearer ${props.idToken}`,
  //     },
  //   })
  //   .catch((error) => {
  //     console.log(error)
  //     throw new Error('getTravelRecord API is failed.')
  //   })
  // // TODO 401 not authorizedの場合、権限が無いページに遷移する
  // if (response.status !== 200) {
  //   throw new Error(
  //     `getTravelRecord is failed. status code is ${response.status}`,
  //   )
  // }
  // console.log(response)
  // return response.data

  return [
    {
      title: "愛媛・高知",
      start: new Date("1995-12-17"),
      end: new Date("1995-12-21"),
    },
    {
      title: "クロアチア",
      start: new Date("2021-12-10"),
      end: new Date("2021-12-15"),
    },
  ];
};

export const postTravelRecord = () => {};

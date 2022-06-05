import { Card, CardHeader, CardMedia } from "@mui/material";

export const TravelRecordCard = () => {
  return (
    <Card>
      <CardHeader title="愛媛・高知" subheader="2022/05/01 - 2022/05/04" />
      <CardMedia
        component="img"
        height="140"
        image="https://user-images.githubusercontent.com/64848616/172041210-2901aeb3-dcbf-423d-9ab8-eb311a4e3202.JPG"
        alt="test picture"
      />
    </Card>
  );
};

import {
  Button,
  Card,
  CardActions,
  CardHeader,
  CardMedia,
} from "@mui/material";

export type TravelRecordCardProps = {
  title: string;
  start: Date;
  end: Date;
};

export const TravelRecordCard = (props: TravelRecordCardProps) => {
  const period = `${props.start.toLocaleDateString()} - ${props.end.toLocaleDateString()}`;
  return (
    <Card raised={true}>
      <CardHeader title={props.title} subheader={period} />
      <CardMedia
        component="img"
        height="140"
        image="https://user-images.githubusercontent.com/64848616/172041210-2901aeb3-dcbf-423d-9ab8-eb311a4e3202.JPG"
        alt={props.title}
      />
      <CardActions>
        <Button size="small">Share</Button>
      </CardActions>
    </Card>
  );
};

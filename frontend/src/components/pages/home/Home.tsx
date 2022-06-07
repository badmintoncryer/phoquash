import { Box, Container, Grid } from "@mui/material";
import { TravelRecordCard } from "components/uiParts/TravelRecordCard/TravelRecordCard";
import { useState } from "react";

type TravelRecord = {
  title: string;
  start: Date;
  end: Date;
};

export const Home = () => {
  const [travelList, setTravelList] = useState<TravelRecord[]>([
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
  ]);

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 4,
          alignItems: "center",
        }}
      >
        <Grid
          container
          direction="column"
          spacing={1}
          justifyContent="flex-start"
          alignItems="stretch"
        >
          {travelList.map((travel) => (
            <Grid item key={travel.title} xs={12}>
              <TravelRecordCard
                title={travel.title}
                start={travel.start}
                end={travel.end}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

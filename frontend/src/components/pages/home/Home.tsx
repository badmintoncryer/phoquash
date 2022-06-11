import { Box, Container, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { TravelRecordCard } from "components/uiParts/TravelRecordCard/TravelRecordCard";
import { useTravelList } from "./hooks/useTravelList";
import { BottomRightFab } from "components/uiParts/BottomRightFab/BottomRightFab";

export const Home = () => {
  const { travelList } = useTravelList();

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
          {travelList &&
            travelList.map((travel) => (
              <Grid item key={travel.title} xs={12}>
                <TravelRecordCard
                  title={travel.title}
                  start={travel.start}
                  end={travel.end}
                />
              </Grid>
            ))}
        </Grid>
        <BottomRightFab>
          <AddIcon />
        </BottomRightFab>
      </Box>
    </Container>
  );
};

import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Slide,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { TravelRecordCard } from "components/uiParts/TravelRecordCard/TravelRecordCard";
import { useTravelList } from "./hooks/useTravelList";
import { BottomRightFab } from "components/uiParts/BottomRightFab/BottomRightFab";
import { forwardRef, useState } from "react";
import { TransitionProps } from "@mui/material/transitions";
import { TravelRecordCreateDialog } from "components/uiParts/TravelRecordCreateDialog/TravelRecordCreateDialog";

export const Home = () => {
  const { travelList } = useTravelList();

  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

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
        <BottomRightFab
          ariaLabel="Add"
          color="primary"
          onClick={handleClickOpen}
        >
          <AddIcon />
        </BottomRightFab>
        <TravelRecordCreateDialog open={open} onClose={handleClose} />
      </Box>
    </Container>
  );
};

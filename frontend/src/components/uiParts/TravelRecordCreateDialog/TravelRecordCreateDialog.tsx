import {
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef, useState } from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";

type TravelRecordCreateDialogProps = {
  open: boolean;
  onClose: () => void;
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const TravelRecordCreateDialog = (
  props: TravelRecordCreateDialogProps
) => {
  const [titleValue, setTitleValue] = useState("");
  const [travelStartDate, setTravelStartDate] = useState<
    Date | null | undefined
  >();
  const [travelFinishDate, setTravelFinishDate] = useState<
    Date | null | undefined
  >();
  // const [startValue, setStartValue] = useState<Date | undefined>();
  // const [endValue, setEndValue] = useState<Date | undefined>();

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      TransitionComponent={Transition}
    >
      <DialogTitle>旅行記録の追加</DialogTitle>
      <DialogContent>
        <Grid
          container
          spacing={3}
          direction="column"
          justifyContent="flex-start"
          alignItems="center"
        >
          <Grid item xs={12}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="タイトル"
              type="text"
              // fullWidth
              variant="standard"
              onChange={(event) => setTitleValue(event.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                label="開始"
                inputFormat="yyyy/MM/dd"
                value={travelStartDate}
                onChange={(date) => setTravelStartDate(date)}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                label="終了"
                inputFormat="yyyy/MM/dd"
                value={travelFinishDate}
                onChange={(date) => setTravelFinishDate(date)}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={props.onClose} color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

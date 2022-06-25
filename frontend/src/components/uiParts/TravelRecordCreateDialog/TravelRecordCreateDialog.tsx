import {
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  ImageList,
  ImageListItem,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef, ReactElement, Ref, useState } from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import ImageUploading, { ImageType } from "react-images-uploading";
import exifer from "exifer";

type TravelRecordCreateDialogProps = {
  open: boolean;
  onClose: () => void;
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export type pictureListType = {
  name: string;
  img: string;
};

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

  const maxNumber = 100;
  const [imageList, setImageList] = useState<ImageType[]>([]);

  const onClickAdd = () => {
    interface Tags {
      [index: string]: string;
    }
    console.log(typeof imageList[0].file);
    imageList.forEach((image) => {
      console.log({ image });
      let tags: Tags = {};
      exifer(image.file).then((result: Tags) => {
        tags = result;
        console.log({ tags });
      });
    });
    props.onClose();
  };

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
          <Grid item>
            <ImageUploading
              multiple
              value={imageList}
              onChange={(imageList) => {
                setImageList(imageList);
              }}
              maxNumber={maxNumber}
              dataURLKey="data_url"
            >
              {({
                imageList,
                onImageUpload,
                onImageRemoveAll,
                // onImageUpdate,
                // onImageRemove,
                isDragging,
                dragProps,
              }) => (
                <div>
                  <Grid
                    container
                    spacing={3}
                    direction="column"
                    justifyContent="flex-start"
                    alignItems="center"
                  >
                    <Grid item>
                      <Button
                        variant="contained"
                        component="label"
                        style={isDragging ? { color: "red" } : undefined}
                        onClick={onImageUpload}
                        {...dragProps}
                      >
                        アップロード
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        variant="contained"
                        component="label"
                        color="secondary"
                        onClick={onImageRemoveAll}
                      >
                        画像の消去
                      </Button>
                    </Grid>
                  </Grid>

                  <ImageList
                    sx={{
                      width: { xs: 350, sm: 500, md: 500, lg: 500, xl: 500 },
                    }}
                    cols={3}
                    rowHeight={164}
                  >
                    {imageList.map((image, index) => (
                      <div key={index}>
                        <ImageListItem key={index}>
                          <img
                            src={`${image["data_url"]}`}
                            // srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                            alt=""
                            loading="lazy"
                            id={image.file?.name || "test"}
                          />
                        </ImageListItem>
                      </div>
                    ))}
                  </ImageList>
                </div>
              )}
            </ImageUploading>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={onClickAdd} color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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
import {
  forwardRef,
  ReactElement,
  Ref,
  useCallback,
  useEffect,
  useState,
} from "react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import ImageUploading, { ImageType } from "react-images-uploading";
import exifer from "exifer";
import heic2any from "heic2any";
import { findEXIFinHEIC } from "exif-heic-js/exif-heic";

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

const dataUriToBlob = (dataUri: string): Blob => {
  const byteString = atob(dataUri.split(",")[1]);
  const mimeString = dataUri.split(",")[0].split(":")[1].split(";")[0];
  // write the bytes of the string to an ArrayBuffer
  const arrayBuffer = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  const UnsignedIntArray = new Uint8Array(arrayBuffer);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
    UnsignedIntArray[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  const blob = new Blob([arrayBuffer], { type: mimeString });
  return blob;
};

interface Tags {
  [index: string]: string;
}

interface TagsListElement {
  fileName: string;
  tags: Tags;
}

export type pictureListType = {
  name: string;
  img: string;
};

export const TravelRecordCreateDialog = (
  props: TravelRecordCreateDialogProps
) => {
  const [update, setUpdate] = useState<boolean>(false);
  const [titleValue, setTitleValue] = useState("");
  const [travelStartDate, setTravelStartDate] = useState<
    Date | null | undefined
  >();
  const [travelFinishDate, setTravelFinishDate] = useState<
    Date | null | undefined
  >();

  const maxNumber = 100;
  const [imageList, setImageList] = useState<ImageType[]>([]);
  const [exifTags, setExifTags] = useState<TagsListElement[]>([]);
  // interface IsProcessing {
  //   fileName: string;
  //   isProcessing: boolean;
  // }
  // 画像ローディング(exif取得)の状態管理のため、一枚ごとのboolean配列を生成
  // const [isLoading, setIsLoading] = useState<IsProcessing[]>([]);
  // // 画像の変換状態管理のため、一枚ごとのboolean配列を生成
  // const [isConverting, setIsConverting] = useState<IsProcessing[]>([]);
  // interface updateIsProcessing {
  //   index: number;
  //   fileName: string;
  // }
  // const startLoading = (props: updateIsProcessing) => {
  //   // すでに同一ファイル名が存在した場合
  //   if (isLoading.some((element) => element.fileName === props.fileName)) {
  //     setIsLoading(
  //       isLoading.map((element) =>
  //         element.fileName === props.fileName
  //           ? { fileName: props.fileName, isProcessing: true }
  //           : element
  //       )
  //     );
  //     return;
  //   }
  //   // 対応するindexのみtrue(読込中)にする
  //   const newIsLoading: IsProcessing = {
  //     fileName: props.fileName,
  //     isProcessing: true,
  //   };
  //   setIsLoading([...isLoading, newIsLoading]);
  // };
  // const finishLoading = (props: updateIsProcessing) => {
  //   // すでに同一ファイル名が存在した場合
  //   if (!isLoading.some((element) => element.fileName === props.fileName)) {
  //     throw new Error("fileName is not exists in isLoading");
  //   }
  //   // 対応するindexのみfalse(読込完了)にする
  //   setIsLoading(
  //     isLoading.map((element) =>
  //       element.fileName === props.fileName
  //         ? { fileName: props.fileName, isProcessing: false }
  //         : element
  //     )
  //   );
  // };
  // const startConverting = (props: updateIsProcessing) => {
  //   console.log({ isConverting });
  //   // すでに同一ファイル名が存在した場合
  //   if (isConverting.some((element) => element.fileName === props.fileName)) {
  //     // setIsConverting(
  //     //   isLoading.map((element) =>
  //     //     element.fileName === props.fileName
  //     //       ? { fileName: props.fileName, isProcessing: true }
  //     //       : element
  //     //   )
  //     // );
  //     return;
  //   }
  //   // 対応するindexのみtrue(読込中)にする
  //   const newIsConverting: IsProcessing = {
  //     fileName: props.fileName,
  //     isProcessing: true,
  //   };
  //   setIsConverting([...isConverting, newIsConverting]);
  // };
  // const finishConverting = (props: updateIsProcessing) => {
  //   if (!isConverting.some((element) => element.fileName === props.fileName)) {
  //     throw new Error("fileName is not exists in isConverting");
  //   }
  //   // 対応するindexのみfalse(変換完了)にする
  //   setIsConverting(
  //     isConverting.map((element) =>
  //       element.fileName === props.fileName
  //         ? { fileName: props.fileName, isProcessing: false }
  //         : element
  //     )
  //   );
  // };

  const onClickAdd = useCallback(() => {
    console.log({ imageList });
    console.log({ exifTags });
    props.onClose();
  }, [exifTags, imageList, props]);
  interface addHeicExifProps {
    image: ImageType;
  }
  const addHeicExif = useCallback((props: addHeicExifProps) => {
    const heicReader = new FileReader();
    heicReader.onload = () => {
      const heicTags = findEXIFinHEIC(heicReader.result);
      setExifTags((exifTags) => {
        // exifTagsに同一ファイル名のオブジェクトが存在するか確認し、その場合には要素の追加を行わない
        if (
          exifTags.some(
            (element) =>
              element.fileName ===
              props.image.file!.name.split(".")[0] + ".JPEG"
          )
        ) {
          return exifTags;
        }

        const newTags: TagsListElement = {
          fileName: props.image.file!.name.split(".")[0] + ".JPEG",
          tags: heicTags,
        };
        console.log([...exifTags, newTags]);
        return [...exifTags, newTags];
      });
    };
    heicReader.readAsArrayBuffer(props.image.file!);
  }, []);

  interface AddExifProps {
    image: ImageType;
  }
  const addExif = useCallback((props: AddExifProps) => {
    exifer(props.image.file).then((result: Tags) => {
      setExifTags((exifTags) => {
        if (
          exifTags.some(
            (element) =>
              element.fileName ===
              props.image.file!.name.split(".")[0] + ".JPEG"
          )
        ) {
          return exifTags;
        }
        const newTags: TagsListElement = {
          fileName: props.image.file!.name,
          tags: result,
        };
        return [...exifTags, newTags];
      });
    });
  }, []);

  const onChange = useCallback(
    (imageList: ImageType[]) => {
      imageList.forEach((image) => {
        if (image.file && image.data_url && image.file.type === "image/heic") {
          addHeicExif({ image: image });
          // heicをjpegに変換し、imageListに登録する
          heic2any({
            blob: dataUriToBlob(image.data_url),
            toType: "image/jpeg",
          }).then((conversionResult) => {
            const dataUrlReader = new FileReader();
            dataUrlReader.onload = (event) => {
              image.data_url = event.target!.result;
              image.file = new File(
                [conversionResult],
                image.file!.name.split(".")[0] + ".JPEG",
                {
                  lastModified: 0,
                  type: "image/jpeg",
                }
              );
              setImageList(imageList);
              setUpdate(!update);
            };
            dataUrlReader.readAsDataURL(conversionResult);
          });
        }
        // exif形式以外の画像の処理
        else if (image.file && image.file.type !== "image/heic") {
          addExif({ image: image });
        }
      });
      setImageList(imageList);
    },
    [addExif, addHeicExif, update]
  );

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
              onChange={onChange}
              maxNumber={maxNumber}
              dataURLKey="data_url"
              acceptType={["jpg", "gif", "png", "heic"]}
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
                        画像の消去 (合計{imageList.length}枚)
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
                    {imageList.map((image, index) => {
                      return (
                        <div key={index}>
                          <ImageListItem key={index}>
                            <img
                              src={`${image["data_url"]}`}
                              alt=""
                              loading="lazy"
                              id={image.file?.name || "test"}
                            />
                          </ImageListItem>
                        </div>
                      );
                    })}
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

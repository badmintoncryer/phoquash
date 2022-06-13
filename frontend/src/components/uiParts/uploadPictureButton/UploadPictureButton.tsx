import { Button } from "@mui/material";
import { FC } from "react";

type UploadPictureButtonProps = {
  onChange: (event: { target: { files: any } }) => void;
};

export const UploadPictureButton: FC<UploadPictureButtonProps> = (
  props: UploadPictureButtonProps
) => {
  return (
    <div>
      <Button variant="contained" component="label">
        Upload File
        <input type="file" multiple hidden onChange={props.onChange} />
      </Button>
    </div>
  );
};

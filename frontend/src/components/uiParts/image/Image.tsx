import { FC, Fragment } from "react";

type ImageProps = {
  file: string;
  name: string;
};

export const Image: FC<ImageProps> = (props) => {
  return (
    <Fragment>
      <img src={props.file} alt={props.name} className="image"></img>
    </Fragment>
  );
};

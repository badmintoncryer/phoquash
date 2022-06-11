import { Fab, styled } from "@mui/material";
import { FC, ReactNode } from "react";

type BottomRightFabProps = {
  // aria-label?: string,
  // color?: "primary" | "secondary" | "inherit";
  children: ReactNode;
};

export const BottomRightFab: FC<BottomRightFabProps> = ({ children }) => {
  const BottomRightFab = styled(Fab)({
    position: "fixed",
    bottom: "1rem",
    right: "1rem",
  });
  return (
    <BottomRightFab aria-label="Add" color="primary">
      {children}
    </BottomRightFab>
  );
};

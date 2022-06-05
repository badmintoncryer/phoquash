import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { Grid } from "@mui/material";
import Logo from "../../../static/logo_transparent.png";

export default function ButtonAppBar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const navigate = useNavigate();
  // HOMEページに遷移
  const handleToTopPage = () => {
    setAnchorEl(null);
    navigate("/");
  };
  const handleCreate = () => {
    setAnchorEl(null);
    navigate("/create");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Grid container direction="row" alignItems="center">
            <Grid item>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  "aria-labelledby": "basic-butoon",
                }}
              >
                <MenuItem onClick={handleToTopPage}>HOMEへ戻る</MenuItem>
                <MenuItem onClick={handleCreate}>新規作成</MenuItem>
                <MenuItem disabled onClick={handleToTopPage}>
                  管理画面
                </MenuItem>
                <MenuItem disabled onClick={handleToTopPage}>
                  ログアウト
                </MenuItem>
              </Menu>
            </Grid>
            <Grid item>
              <img src={Logo} alt="logo" width={50} />
            </Grid>
            <Grid item>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                phoquash
              </Typography>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

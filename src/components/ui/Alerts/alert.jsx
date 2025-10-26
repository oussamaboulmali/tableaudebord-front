import * as React from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import Icon from "@mdi/react";
import * as icons from "@mdi/js";
import { useEffect } from "react";

export default function TransitionAlerts({
  open,
  setOpen,
  iconName,
  message,
  severity,
}) {
  useEffect(() => {
    const timeId = setTimeout(() => {
      setOpen(false);
    }, 3000);
    return () => {
      clearTimeout(timeId);
    };
  }, [open]);

  return (
    <Box sx={{ width: "100%" }}>
      <Collapse in={open}>
        <Alert
          severity={severity}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setOpen(false);
              }}
            >
              <Icon
                path={icons[iconName]}
                size={1}
                sx={{ cursor: "pointer" }}
              />
            </IconButton>
          }
          sx={{ mb: 2, mr: 2, position: "absolute", bottom: 0, right: 0 }}
        >
          {message}
        </Alert>
      </Collapse>
    </Box>
  );
}

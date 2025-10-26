import React, { useState } from "react";
import { Popover } from "@mui/material";
import Icon from "@mdi/react";
import { mdiBell } from "@mdi/js";

export default function Notification() {
  const [anchorEl, setAnchorEl] = useState(null);
  const countNotif = 20;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
      <div id="notifProfil" onClick={(e) => handleClick(e)}>
        <Icon path={mdiBell} size={1} />
        <span className="button__badge">
          {countNotif <= 9 ? countNotif : "+9"}
        </span>
      </div>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        elevation={5}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        sx={{ marginTop: "0px" }}
        marginThreshold={65}
        PaperProps={{
          style: {
            padding: 10,
            width: 280,
            height: 150,
            maxHeight: 350,
            overflowY: "auto",
          },
        }}
      >
        <div>
          <b>looool</b>
          <b>looool</b>
          <b>looool</b>
          <p>looool</p>
          <p>looool</p>
          <p>looool</p>
          <p>looool</p>
          <p>looool</p>
          <p>looool</p>
          <p>looool</p>
          <p>looool</p>
          <p>looool</p>
          <p>looool</p>
          <p>looool</p>
          <p>looool</p>
          <p>looool</p>
          <p>looool</p>
          <p>looool</p>
          <p>looool</p>
          <p>looool</p>
          <p>looool</p>
          <p>looool</p>
        </div>
      </Popover>
    </>
  );
}

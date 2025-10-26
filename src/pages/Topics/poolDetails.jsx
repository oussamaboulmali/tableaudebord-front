import React, { useState, useEffect } from "react";
import { Dialog, Divider, Slide } from "@mui/material";
import Icon from "@mdi/react";
import * as icons from "@mdi/js";
import * as Gfunc from "../../helpers/Gfunc";
import { mdiAccount } from "@mdi/js";
import { mdiEye } from "@mdi/js";
import { mdiCalendar } from "@mdi/js";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="left" ref={ref} {...props} />;
});

export default function PoolDetails({ row }) {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };
  return (
    <div>
      <div title={"Voir plus de details de log"} onClick={handleOpen}>
        <Icon
          path={mdiEye}
          size={1}
          style={{ cursor: "pointer", color: "#265396" }}
        />
      </div>

      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        transitionDuration={500}
        PaperProps={{
          style: {
            right: "0",
            position: "fixed",
            width: "350px",
          },
        }}
      >
        <div onClick={handleClose} className="header-close">
          <p>Les détails de la dépache</p>
          <Icon
            path={icons["mdiClose"]}
            size={1}
            style={{ cursor: "pointer", color: "white" }}
          />
        </div>
        <div id="log-details-container">
          <div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gridGap: "5px",
                justifyContent: "start",
                marginBottom: "8px",
              }}
            >
              <Icon
                path={mdiCalendar}
                size={0.9}
                style={{
                  color: "gray",
                }}
              />
              <b
                style={{
                  color: "gray",
                }}
              >
                Modifié le
              </b>
            </div>
            <Divider />
            {Gfunc.formaterDate(row?.updated_at)}
          </div>
          <br />
          <div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gridGap: "5px",
                justifyContent: "start",
                marginBottom: "8px",
              }}
            >
              <Icon
                path={mdiAccount}
                size={0.9}
                style={{
                  color: "gray",
                }}
              />
              <b
                style={{
                  color: "gray",
                }}
              >
                Modifié par
              </b>
            </div>
            <Divider />
          </div>
          <br />
          <div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gridGap: "5px",
                justifyContent: "start",
                marginBottom: "8px",
              }}
            >
              <Icon
                path={mdiCalendar}
                size={0.9}
                style={{
                  color: "gray",
                }}
              />
              <b
                style={{
                  color: "gray",
                }}
              >
                Publié le
              </b>
            </div>
            <Divider />
            {Gfunc.formaterDate(row?.published_at)}
          </div>
          <br />
          <div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gridGap: "5px",
                justifyContent: "start",
                marginBottom: "8px",
              }}
            >
              <Icon
                path={mdiAccount}
                size={0.9}
                style={{
                  color: "gray",
                }}
              />
              <b
                style={{
                  color: "gray",
                }}
              >
                Publié par
              </b>
            </div>
            <Divider />
            {Gfunc.formaterDate(row?.published_at)}
          </div>
        </div>
      </Dialog>
    </div>
  );
}

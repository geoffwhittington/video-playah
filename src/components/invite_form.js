import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

export default function InviteDialog(props) {
  const [channelUrl, setChannelUrl] = useState(null);

  const addChannel = () => {
    if (props.addChannel) props.addChannel(channelUrl);
  };

  return (
    <Dialog minWidth={"sm"} open={props.open} onClose={props.onClose}>
      <DialogTitle>
        <Grid container>
          <Grid item style={{ paddingRight: "10px" }}></Grid>
          <Grid item>Add Channel</Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Supported channels:
          <ul>
            <li>Youtube</li>
            <li>m3u</li>
          </ul>
        </DialogContentText>
        <form noValidate autoComplete="off">
          <Grid container>
            <Grid item xs="12">
              <TextField
                fullWidth
                required
                id="channel-url"
                label="Channel URL"
                onChange={(e) => {
                  setChannelUrl(e.target.value);
                }}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} color="primary">
          Close
        </Button>
        <Button onClick={addChannel} color="primary">
          Add Channel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

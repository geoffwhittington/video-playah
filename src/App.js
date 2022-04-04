import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import ReactPlayer from "react-player";
import KinBalanceWidget from "./components/kin_balance_widget";
import { setupWallet, submitPayment } from "./components/lib";
import { userService } from "./components/service";
import Button from "@mui/material/Button";
import VideoCard from "./components/video_card";
import { DataGrid } from "@mui/x-data-grid";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import IconButton from "@mui/material/IconButton";
import AddChannelForm from "./components/invite_form";
import DeleteIcon from "@mui/icons-material/Delete";
import TextField from "@mui/material/TextField";

function App() {
  const [walletAccounts, setWalletAccounts] = useState(null);
  const [openPaymentError, setOpenPaymentError] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [created, setCreated] = useState();
  const [productionEnvironment, setProductionEnvironment] = useState(false);
  const [hasBalance, setHasBalance] = useState(false);
  const [updateIndicator, setUpdateIndicator] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [addChannelDialogOpen, setAddChannelDialogOpen] = useState(false);
  const [channelUrl, setChannelUrl] = useState(null);

  useEffect(() => {
    initWallet();
    getVideos();
  }, []);

  /*  const columns = [
    {
      field: "title",
      headerName: "Title",
      width: 150,
    },
    {
      field: "description",
      headerName: "Description",
      width: 150,
    },
  ];
*/
  const columns = [
    {
      field: "id",
      headerName: "",
      width: 90,
      renderCell: (params) => {
        return (
          <IconButton
            color="primary"
            aria-label="upload picture"
            component="span"
            onClick={() => {
              if (params.row == selectedVideo) {
                setSelectedVideo(null);
                setPlaying(false);
              } else if (params.row != selectedVideo) {
                setSelectedVideo(params.row);
                setPlaying(true);
              }
            }}
          >
            {params.row == selectedVideo && <PauseIcon />}
            {params.row != selectedVideo && <PlayArrowIcon />}
          </IconButton>
        );
      },
    },
    {
      field: "title",
      headerName: "Title",
      width: 200,
    },
    {
      field: "cost",
      headerName: "Cost",
      renderCell: (params) => {
        return <>{params.value} KIN / 10 seconds</>;
      },
    },
    {
      field: "url",
      headerName: "",
      width: 90,
      renderCell: (params) => {
        return (
          <IconButton
            color="primary"
            aria-label="remove"
            component="span"
            onClick={() => {
              if (params.row == selectedVideo) {
                setSelectedVideo(null);
                setPlaying(false);
              }
              let newVideos = videos.filter(function (item) {
                return item !== params.row;
              });
              window.localStorage.setItem(
                "channels",
                JSON.stringify(newVideos)
              );
              setVideos(newVideos);
            }}
          >
            <DeleteIcon />
          </IconButton>
        );
      },
    },
  ];
  const addChannel = async (channelUrl) => {
    let newChannel = {
      id: videos.length + 1,
      url: channelUrl,
      title: "My Video",
      address: "GmGgxMHrr86YV2MwQqsjD1EAp7TWKD57uy7pHcPrBYVv",
      cost: 1,
    };

    let newVideos = [...videos, newChannel];
    window.localStorage.setItem("channels", JSON.stringify(newVideos));
    setVideos(newVideos);
    setSelectedVideo(newChannel);
    setPlaying(true);
  };
  const getVideos = async () => {
    let storedVideos = window.localStorage.getItem("channels");
    if (!storedVideos) storedVideos = [];
    else {
      storedVideos = JSON.parse(storedVideos);
    }
    let videos;
    if (storedVideos.length == 0) {
      videos = [
        ...storedVideos,
        {
          id: storedVideos.length + 1,
          url: "http://cdnapi.kaltura.com/p/1878761/sp/187876100/playManifest/entryId/1_usagz19w/flavorIds/1_5spqkazq,1_nslowvhp,1_boih5aji,1_qahc37ag/format/applehttp/protocol/http/a.m3u8",
          title: "Great video",
          address: "GmGgxMHrr86YV2MwQqsjD1EAp7TWKD57uy7pHcPrBYVv",
          cost: 1,
        },
        {
          id: storedVideos.length + 2,
          url: "https://cbclivedai5-i.akamaihd.net/hls/live/567235/event2/CBOT/master5.m3u8",
          title: "CBC TV (Ontario)",
          address: "GmGgxMHrr86YV2MwQqsjD1EAp7TWKD57uy7pHcPrBYVv",
          cost: 1,
        },
        {
          id: storedVideos.length + 3,
          url: "http://tscstreaming-lh.akamaihd.net/i/TSCLiveStreaming_1@91031/master.m3u8",
          title: "Shopping Channel",
          address: "GmGgxMHrr86YV2MwQqsjD1EAp7TWKD57uy7pHcPrBYVv",
          cost: 1,
        },
      ];
    } else {
      videos = storedVideos;
    }

    setVideos(videos);
  };
  const onPayment = async (paymentResult) => {
    setWalletAccounts(paymentResult.wallet);
    setUpdateIndicator(new Date());
  };

  const initWallet = () => {
    const localSetupWallet = async () => {
      let wallet = null;
      let walletDetails = window.localStorage.getItem("wallet");
      if (walletDetails) {
        wallet = JSON.parse(walletDetails);
      }

      let productionEnvironment = false;
      setProductionEnvironment(productionEnvironment);

      try {
        let wallet_and_accounts = await setupWallet(
          wallet,
          productionEnvironment
        );

        if (wallet_and_accounts) {
          setWalletAccounts(wallet_and_accounts);
          window.localStorage.setItem(
            "wallet",
            JSON.stringify(wallet_and_accounts.wallet)
          );
          onPayment(wallet_and_accounts);
          setCreated(true);
        }
      } catch (e) {
        console.log(e);
        console.log("Error initializing wallet. Clear your wallet and reload");
      }
    };
    return localSetupWallet();
  };

  const onPlay = () => {
    console.log("playing");
  };
  const onPause = () => {
    console.log("paused");
  };
  const onEnded = () => {
    console.log("ended");
    setSelectedVideo(null);
  };
  const onPaymentSend = () => {};
  const onProgress = async () => {
    await submitPayment(
      walletAccounts,
      selectedVideo.address,
      selectedVideo.cost,
      null,
      onPaymentSend,
      onPayment,
      { address: selectedVideo.address, amount: selectedVideo.cost },
      false
    );
    console.log(walletAccounts);
    console.log("paid...");
    setUpdateIndicator(true);
  };
  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={2}
      style={{ padding: 5, width: "100%" }}
    >
      <Grid item xs={12}>
        <ReactPlayer
          url={selectedVideo ? selectedVideo.url : null}
          controls={true}
          onPlay={onPlay}
          progressInterval={1000 * 5}
          onPause={onPause}
          onEnded={onEnded}
          onProgress={onProgress}
          playing={playing}
          width={"100%"}
          height={"100%"}
        />
      </Grid>
      <Grid item xs={12}>
        {walletAccounts && (
          <KinBalanceWidget
            wallet={walletAccounts.publicKey}
            updateIndicator={updateIndicator}
            clickUrl={`https://solscan.io/account/${walletAccounts.publicKey}`}
            deleteUrl={`https://solscan.io/account/${walletAccounts.publicKey}`}
          />
        )}
      </Grid>
      <Grid item xs={12} style={{ textAlign: "center" }}>
        <TextField
          fullWidth
          id="channel-url"
          label="Channel URL"
          onChange={(e) => {
            setChannelUrl(e.target.value);
          }}
        />
        <Button
          variant="contained"
          onClick={() => {
            addChannel(channelUrl);
          }}
        >
          Play
        </Button>
      </Grid>
      <Grid item xs={12} style={{ width: "100%" }}>
        {videos && (
          <DataGrid
            autoHeight={true}
            rows={videos}
            columns={columns}
            pageSize={10}
          />
        )}
      </Grid>
    </Grid>
  );
}

export default App;

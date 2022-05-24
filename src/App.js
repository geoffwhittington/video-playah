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
import Link from "@mui/material/Link";
import AddChannelForm from "./components/invite_form";
import DeleteIcon from "@mui/icons-material/Delete";
import TextField from "@mui/material/TextField";
import AppLogo from "./assets/videocafe-io.png";
import PerkLogo from "./assets/perk-icon.png";
import ReactMarkdown from "react-markdown";
import SvgIcon from "@mui/material/SvgIcon";
import { ReactComponent as KinIcon } from "./components/KIN.svg";
import Video from "./components/Video";
import { VolumeDown } from "@mui/icons-material";

function App() {
  const [wallet, setWallet] = useState(null);
  const [openPaymentError, setOpenPaymentError] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [created, setCreated] = useState();
  const [productionEnvironment, setProductionEnvironment] = useState(false);
  const [hasBalance, setHasBalance] = useState(false);
  const [updateIndicator, setUpdateIndicator] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [latestTransaction, setLatestTransaction] = useState(null);
  const [videos, setVideos] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [addChannelDialogOpen, setAddChannelDialogOpen] = useState(false);
  const [channelUrl, setChannelUrl] = useState(null);
  const [buffering, setBuffering] = useState(false);
  const [balance, setBalance] = useState(0);
  useEffect(() => {
    initWallet();
    get_videos();
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
      field: "ff",
      headerName: " ",
      width: 80,
      renderCell: (params) => {
        return <img src={params.row.img} height="40em" />;
      },
    },
    {
      field: "title",
      headerName: "Title",
      width: 200,
    },
    {
      field: "cost",
      headerName: "KIN / 30 seconds",
      width: 170,
      renderCell: (params) => {
        return <>{params.value}</>;
      },
    },
    {
      field: "description",
      headerName: "Description",
      width: 400,
      renderCell: (params) => {
        return <ReactMarkdown children={params.value} />;
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
      id: videos.length * 2 + 1,
      url: channelUrl,
      title: `Video ${videos.length + 1}`,
      address: "2oH1oGkdZe9D8a8XFwhgBvwZQXyeMx4rsMpqjygHPFaz",
      cost: 10,
    };

    let newVideos = [...videos, newChannel];
    window.localStorage.setItem("channels", JSON.stringify(newVideos));
    setVideos(newVideos);
    setSelectedVideo(newChannel);
    setPlaying(true);
  };
  async function get_videos() {
    let response = await userService.appFetch(
      `${process.env.REACT_APP_API_SERVER}/api/campaigns?category=videocafe`,
      "get"
    );
    if (response.ok) {
      var rows = [];
      if (response.data && response.data.campaigns) {
        var i;
        for (i = 0; i < response.data.campaigns.length; i++) {
          let data = response.data;
          rows.push({
            id: data.campaigns[i].id.toString(),
            url: data.campaigns[i].extra.image_url,
            title: data.campaigns[i].title,
            description: data.campaigns[i].description,
            address: data.campaigns[i].extra.instructions,
            img: data.campaigns[i].extra.icon_url,
            cost: data.campaigns[i].amount,
          });
        }
      }
      setVideos(rows);
    }
  }
  const onPayment = async (paymentResult) => {
    if (paymentResult.success) {
      setLatestTransaction(paymentResult.transaction);
      setWallet(paymentResult.wallet);
    } else {
      setLatestTransaction(null);
    }
    setUpdateIndicator(new Date());
  };

  const initWallet = () => {
    const localSetupWallet = async () => {
      let wallet = null;
      let walletDetails = window.localStorage.getItem("wallet");
      if (walletDetails) {
        wallet = JSON.parse(walletDetails);
      }

      let productionEnvironment = !(
        process.env.REACT_APP_API_SERVER === "http://localhost:8000"
      );
      setProductionEnvironment(productionEnvironment);

      try {
        let wallet_and_accounts = await setupWallet(
          wallet,
          productionEnvironment
        );

        if (wallet_and_accounts) {
          setWallet(wallet_and_accounts.wallet);
          window.localStorage.setItem(
            "wallet",
            JSON.stringify(wallet_and_accounts.wallet)
          );
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
    if (balance == 0) {
      setSelectedVideo(null);
      setPlaying(false);
    }

    console.log("playing");
  };
  const onPause = () => {
    console.log("paused");
  };
  const onEnded = () => {
    console.log("ended");
    setSelectedVideo(null);
  };
  const onBuffer = () => {
    setBuffering(true);
    if (balance == 0) setPlaying(false);
  };

  const onBufferEnd = () => {
    setBuffering(false);
  };
  const onBalanceUpdate = (balance) => {
    if (balance == 0) {
      setSelectedVideo(null);
      setPlaying(false);
    }
    setBalance(balance);
  };
  const onPaymentSend = () => {};
  const onProgress = async () => {
    if (balance == 0) {
      setSelectedVideo(null);
      setPlaying(false);
    }

    if (buffering) return;
    await submitPayment(
      wallet,
      selectedVideo.address,
      selectedVideo.cost,
      null,
      onPaymentSend,
      onPayment,
      { address: selectedVideo.address, amount: selectedVideo.cost },
      productionEnvironment
    );

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
      {!selectedVideo && (
        <>
          <Grid item xs={12}>
            <img
              alt="video cafe dot io"
              src={AppLogo}
              style={{
                width: "10em",
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <p>
              <h2>👛 Top-up your wallet</h2>
              <h2>🎞️ Watch some vids</h2>
            </p>
          </Grid>
        </>
      )}
      {selectedVideo && (
        <>
          <Grid item xs={12}>
            <ReactPlayer
              url={selectedVideo ? selectedVideo.url : null}
              controls={true}
              onPlay={onPlay}
              progressInterval={1000 * 30}
              onPause={onPause}
              onEnded={onEnded}
              onBuffer={onBuffer}
              onBufferEnd={onBufferEnd}
              onProgress={onProgress}
              playing={playing}
              width={"100%"}
              height={"100%"}
            />
          </Grid>
        </>
      )}
      <Grid item xs={12}>
        {wallet && (
          <KinBalanceWidget
            wallet={wallet.publicKey}
            updateIndicator={updateIndicator}
            clickUrl={`https://kinscan.io/address/${wallet.publicKey}`}
            deleteUrl={`https://kinscan.io/address/${wallet.publicKey}`}
            onBalanceUpdate={onBalanceUpdate}
          />
        )}
      </Grid>
      {latestTransaction && (
        <Grid item xs={12}>
          <Link href={`https://kinscan.io/tx/${latestTransaction}`}>
            Sent {selectedVideo.cost} KIN to{" "}
            {`${selectedVideo.address.substring(
              0,
              4
            )}...${selectedVideo.address.slice(-4)}`}
          </Link>
        </Grid>
      )}
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

      <Grid item xs={12} style={{ width: "90%" }}>
        {videos && (
          <DataGrid
            autoHeight={true}
            rows={videos}
            columns={columns}
            pageSize={10}
          />
        )}
      </Grid>
      <Grid item xs={12} style={{ width: "90%" }}>
        {videos.map((video, index) => (
          <Video
            title={video.title}
            description={video.description}
            img={video.img}
            time={"30 secs"}
          />
        ))}
      </Grid>
      <Grid item xs={12}>
        <h5>
          Powered by <Link href="https://perk.exchange">Perk.Exchange</Link>
        </h5>
      </Grid>
    </Grid>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import Chip from "@mui/material/Chip";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SvgIcon from "@mui/material/SvgIcon";
import { ReactComponent as KinIcon } from "./KIN.svg";
import KinBalance from "./kin_balance";

export default function KinBalanceWidget(props) {
  return (
    <Chip
      avatar={
        <SvgIcon titleAccess="KIN" style={{ height: 15, width: 15 }}>
          <KinIcon />
        </SvgIcon>
      }
      style={{ fontSize: "24px" }}
      label={
        <KinBalance
          wallet={props.wallet}
          updateIndicator={props.updateIndicator}
        />
      }
      onDelete={() => {
        window.location = props.deleteUrl;
      }}
      deleteIcon={<AccountBalanceWalletIcon />}
      onClick={() => {
        window.location = props.clickUrl;
      }}
    />
  );
}

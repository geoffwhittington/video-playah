import React, { useEffect, useState } from "react";
import { KinClient, KinProd, KinTest } from "@kin-sdk/client";

export const getBalance = async (wallet, production) => {
  if (!wallet) return null;

  var client = new KinClient(production ? KinProd : KinTest, {
    appIndex: 161,
  });
  let balances = await client.getBalances(wallet);

  if (balances && balances[0]) {
    let balance = parseFloat(balances[0][0].balance);
    return balance;
  }
  return null;
};

export default function KinBalance({ wallet, updateIndicator }) {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    console.log("updating baance");
    async function updateBalance() {
      let productionEnvironment = false;

      let balance = await getBalance(wallet, productionEnvironment);

      setBalance(balance);
    }
    updateBalance();
  }, [updateIndicator]);

  if (balance === null) return <>...</>;
  else return <>{balance}</>;
}

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

export default function KinBalance({
  wallet,
  updateIndicator,
  onBalanceUpdate,
}) {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    async function updateBalance() {
      let productionEnvironment = !(
        process.env.REACT_APP_API_SERVER === "http://localhost:8000"
      );

      let balance = await getBalance(wallet, productionEnvironment);

      setBalance(balance);
      onBalanceUpdate(balance);
    }
    updateBalance();
  }, [updateIndicator]);

  if (balance === null) return <>...</>;
  else return <>{balance}</>;
}

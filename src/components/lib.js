import {
  createWallet,
  KinClient,
  KinProd,
  KinTest,
  PrivateKey,
  bs58encode,
  bs58decode,
} from "@kin-sdk/client";

function WalletException(message, e) {
  this.message = message;
  this.exception = e;
}

function signer(privateKey, data) {
  let pk = PrivateKey.fromSecret(privateKey);
  let data_buffer = bs58decode(data);
  let buffer = pk.kp.sign(data_buffer);
  let encoded_buffer = bs58encode(buffer);
  return encoded_buffer;
}

export async function setupWallet(
  walletDetails,
  productionEnvironment = false
) {
  if (walletDetails) {
    let wallet = createWallet("import", walletDetails);
    let tokenAccounts = await resolveTokenAccounts(
      wallet,
      productionEnvironment
    );

    wallet.signer = signer;

    return {
      wallet: wallet,
      tokenAccounts: tokenAccounts,
    };
  } else {
    let wallet = createWallet("create", {});

    // create account
    await createAccount(wallet, productionEnvironment);

    let tokenAccounts = await resolveTokenAccounts(
      wallet,
      productionEnvironment
    );

    wallet.signer = signer;

    return {
      wallet: wallet,
      tokenAccounts: tokenAccounts,
    };
  }
}

export async function createAccount(wallet, productionEnvironment = false) {
  var client = new KinClient(productionEnvironment ? KinProd : KinTest, {
    appIndex: 161,
  });
  try {
    const [result, error] = await client.createAccount(wallet.secret);
    if (error) {
      throw new WalletException("Cannot create account", error);
    } else {
      return await resolveTokenAccounts(wallet, productionEnvironment);
    }
  } catch (e) {
    throw new WalletException("Cannot create account", e);
  }
}

export async function resolveTokenAccounts(
  wallet,
  productionEnvironment = false
) {
  var client = new KinClient(productionEnvironment ? KinProd : KinTest, {
    appIndex: 161,
  });
  try {
    const [result, error] = await client.getBalances(wallet.publicKey);
    if (error) {
      return WalletException("Cannot create token account", error);
    }

    return result;
  } catch (e) {
    throw new WalletException("Cannot create token account", e);
  }
}

export async function requestAirdrop(
  wallet,
  amount,
  callback,
  productionEnvironment = false
) {
  var client = new KinClient(productionEnvironment ? KinProd : KinTest, {
    appIndex: 161,
  });
  try {
    var tokenAccounts = await resolveTokenAccounts(
      wallet,
      productionEnvironment
    );

    const [result, error] = await client.requestAirdrop(
      wallet.publicKey,
      amount
    );
    if (error) {
      throw new WalletException("Cannot request airdrop", error);
    }

    if (callback) {
      callback({
        wallet: wallet,
        tokenAccounts: tokenAccounts,
      });
    }
  } catch (e) {
    throw new WalletException("Cannot request airdrop", e);
  }
}

export async function submitPayment(
  wallet,
  destinationAddress,
  amount,
  memo = null,
  onPaymentSubmitCallback = null,
  onPaymentEndCallback = null,
  data = null,
  productionEnvironment = false
) {
  if (onPaymentSubmitCallback) onPaymentSubmitCallback();
  var client = new KinClient(productionEnvironment ? KinProd : KinTest, {
    appIndex: 161,
  });
  try {
    const [result, e] = await client.submitPayment({
      secret: wallet.secret,
      tokenAccount: wallet.publicKey,
      amount: amount,
      destination: destinationAddress,
      memo: memo,
    });
    if (e) {
      if (onPaymentEndCallback)
        onPaymentEndCallback({
          success: false,
          transaction: null,
          data: data,
          error: e,
        });
    } else {
      let tokenAccounts = await resolveTokenAccounts(
        wallet,
        productionEnvironment
      );
      if (onPaymentEndCallback) {
        onPaymentEndCallback({
          success: true,
          transaction: result,
          wallet: wallet,
          tokenAccounts: tokenAccounts,
          data: data,
          error: null,
        });
      }
    }
  } catch (e) {
    if (onPaymentEndCallback)
      onPaymentEndCallback({
        success: false,
        transaction: null,
        data: data,
        error: e,
      });
  }
}

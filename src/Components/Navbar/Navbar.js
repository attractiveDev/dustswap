import React from "react";
import classes from "./Navbar.module.scss";
import img from "../../Assets/DustSwapLogo.png";
import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import config from '../../Config/config.json';
import { setupNetwork } from '../../until/wallet';
import { styled } from "@mui/material/styles";
import walletConnect from "../../Assets/WalletConnect.png";
import metamask from "../../Assets/MetaMask.png";
import diamond from '../../Assets/diamond.png';
import logoutImg from '../../Assets/logout.png';

export const Injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 25, 338, 56],
});

export const WalletConnect = new WalletConnectConnector({
  rpc: { 56: config.write_rpc },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  supportedChainIds: [1, 3, 4, 5, 42, 25, 338, 56],
});

const Title = styled('span')({
  color: 'white',
  fontWeight: '500',
  fontSize: '20px',
  lineHeight: '24px',
})

function Navbar() {
  const { activate, deactivate, account, chainId } = useWeb3React();

  const MetaMask = async () => {
    const provider = await Injected.getProvider();
    const hasSetup = await setupNetwork(provider);
    if (hasSetup) {
      activate(Injected);
    }
  }

  const Wallet = async () => {
    const provider = await WalletConnect.getProvider();
    const hasSetup = await setupNetwork(provider);
    if (hasSetup) activate(WalletConnect);
  }

  const logout = () => {
    deactivate();
  }
  return (
    <>
      <div className={classes["navbar"]}>
        <div className={classes["left"]} >
          <img className={classes["logo_img_sm"]} src={img} alt="" />
          <span>DustSwap </span>
        </div>
        {
          (account && chainId) &&
          <div className={classes["right"]}>
            <Title>{`${account.slice(0, 5)}...${account.slice(-5, -1)}`}</Title>
            <img src={diamond} alt="" />
            <img onClick={() => logout()} src={logoutImg} style={{ width: '70px' }} alt="" />
          </div>
        }
        {
          (!account && !chainId) &&
          <div className={classes["right"]}>
            <img onClick={() => Wallet()} src={walletConnect} alt="" />
            <img onClick={() => MetaMask()} src={metamask} alt="" />
          </div>
        }

      </div>
    </>
  );
}

export default Navbar;

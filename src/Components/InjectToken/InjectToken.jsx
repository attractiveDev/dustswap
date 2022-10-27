import { React, useState, useEffect } from "react";
import classes from "./InjectToken.module.scss";
import ImportToken from "../ImportToken";
import { isAddress } from '../../until/isAddress';
import ERC20 from '../../contract/erc20.json';
import config from '../../Config/config.json';
import { ethers } from "ethers";
import { useWeb3React } from '@web3-react/core'
import Loading from 'react-loading-components';
import { toast } from "react-toastify";
import TreasuryAbi from '../../contract/TreasuryManager.json';

const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
function InjectToken() {
    const { library, account } = useWeb3React();
    const [token, setToken] = useState("");
    const [validata, setValidata] = useState();
    const [tokenNm, setTokenNm] = useState();
    const [modalVisible, setModalVisible] = useState(false);
    const [balance, setBalance] = useState();
    const [loading, setLoading] = useState(false);
    const [tierStr, setTierStr] = useState('No Tier');

    const updateValue = (event) => {
        if (!!account) {
            document.getElementById('tokenAdr').style.borderColor = '#43ABE0'
            const input = event.target.value;
            setToken(input);
        } else {
            toast("Connect your wallet!", { position: "bottom-left", type: "error" })
        }
    }
    const handleModal = async () => {
        if (!token) {
            toast("Input token Address!", { position: "bottom-left", type: "error" })
            document.getElementById('tokenAdr').style.borderColor = '#ff6347'
            return false
        }
        if (isAddress(token)) {
            setLoading(true);
            let tokenContract = new ethers.Contract(token, ERC20, readProvider);
            const tempTokenName = await tokenContract.symbol();
            let userTokenContract = new ethers.Contract(token, ERC20, library?.getSigner());
            const tempBalance = await userTokenContract.balanceOf(account);
            setBalance(ethers.utils.formatEther(tempBalance));
            setTokenNm(tempTokenName);
            setModalVisible(true);
            setValidata('');
            setLoading(false);
        }
        else if (!isAddress(token)) {
            setValidata("Not Found Token");
            setModalVisible(true);
        }
    }
    const hanldeTier = async () => {
        let treasuryContract = new ethers.Contract(config.injectContract, TreasuryAbi.abi, library?.getSigner());
        if(!!account && treasuryContract){

            let tier = await treasuryContract.isTier1(account);
            switch(tier.toString()){
                case "1":
                    setTierStr("Silver");
                    break;
                case "2":
                    setTierStr("Gold");
                    break;
                case "3":
                    setTierStr("Diamond");
                    break;
                default:
                    setTierStr("No Tier");
        }
        }
    }
    useEffect(() => {
        (async () => {
            await hanldeTier();
          })();
    })
    return (
        <>
            <div className={classes["container"]}>
                <div className={classes["token-input"]}>
                    <input id='tokenAdr' required onChange={updateValue} type="text" value={token} placeholder='Paste Token Address...' />
                </div>
                <div className={classes["import-btn"]}>
                    <div onClick={() => handleModal()} className={classes["btn"]}>
                        IMPORT TOKEN
                    </div>
                    {
                        loading ? <Loading type='spinning_circles' width={'70'} height={'70'} fill='#43ABE0' />
                            :
                            <ImportToken balance={balance} tokenName={tokenNm} validata={validata} modalVisible={modalVisible} setModalVisible={setModalVisible} tokenAddress={token} />
                    }
                </div>
                <div className={classes["tier"]}>
                    <div>
                        <span>Dusting Tier : </span> {tierStr}
                    </div>
                </div>
            </div>
        </>
    );
}

export default InjectToken; 
import { React, useEffect, useState } from "react";
import millify from "millify";
import InjectModal from '../InjectModal'
import classes from "./TokenInfo.module.scss";
import { fetchPrice } from '../../until/uniswap';
import Skeleton from '@mui/material/Skeleton';
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import erc20 from '../../contract/erc20.json';
import TreasuryAbi from '../../contract/TreasuryManager.json'
import config from '../../Config/config.json';
import { useSelector, useDispatch } from "react-redux";
import { deleteToken } from "../../redux/action/tokenListAction";

function TokenInfo(props) {
    const dispatch = useDispatch();
    const tokenInfo = useSelector((state) => state.tokenList.tokenInfo);
    const { whiteOutline, id, tokenName, tokenAddress } = props;
    const { account, library } = useWeb3React();
    const [tokenBalance, setTokenBalance] = useState();
    const [modalVisible, setModalVisible] = useState(false);
    const [liquidity, setLiquidity] = useState();
    const [marketCap, setMarketCap] = useState();
    const [priceUsd, setPriceUsd] = useState();
    const [priceEth, setPriceEth] = useState();
    const [treasuryAmount, setTreasuryAmount] = useState();

    const handleRemove = () => {
        tokenInfo.splice(id, 1);
        localStorage.setItem("tokenLists", JSON.stringify(tokenInfo));
        dispatch(deleteToken(tokenInfo));
    }
    const tokenInfoFetch = async () => {
        try {
            let tokenContract = new ethers.Contract(tokenAddress, erc20, library?.getSigner());
            let treasuryContract = new ethers.Contract(config.injectContract, TreasuryAbi.abi, library?.getSigner());
           
            if(tokenContract && treasuryContract && !!account){
                const tempTreasuryAmount = await treasuryContract.getInjectedAmount(tokenAddress, account);
                const balance = await tokenContract.balanceOf(account);
                const decimals = await tokenContract.decimals();
                setTreasuryAmount(ethers.utils.formatUnits(tempTreasuryAmount, decimals));
                setTokenBalance(ethers.utils.formatUnits(balance, decimals));
            }
            const dataInfo = await fetchPrice([tokenAddress.toLowerCase()]);
            setLiquidity(dataInfo.lpHoldingUSD);
            setMarketCap(dataInfo.marketCap);
            setPriceUsd(dataInfo.price);
            setPriceEth(dataInfo.ethPrice);
        }
        catch (err) {
            console.log("err", err);
        }
    }
    useEffect(() => {
        (async () => {
            await tokenInfoFetch();
          })();   
    })
    return (
        <>
            <div className={whiteOutline ? classes["container--white"] : classes["container"]}>
                <div className={whiteOutline ? classes["row-1--white"] : classes["row-1"]}>
                    <h1>{tokenName}</h1>
                    <div onClick={() => handleRemove()} className={whiteOutline ? classes["close-btn--white"] : classes["close-btn"]}>X</div>
                </div>
                <p>{tokenAddress}</p>
                <div className={whiteOutline ? classes["row-2--white"] : classes["row-2"]}>
                    <div className={classes["row-2-item"]} style={{ display: 'flex' }}><span style={{ color: "#43ABE0", paddingRight: "5px" }}>Liquidity: <span style={{ color: 'white' }}>$</span></span>
                        {
                            liquidity ? millify(liquidity * 2, { precision: 2 })
                                :
                                <Skeleton sx={{ bgcolor: '#8e8e8e' }} width={100} height={20} variant="rounded"
                                />
                        }
                    </div>
                    <div className={classes["row-2-item"]} style={{ display: 'flex' }}><span style={{ color: "#43ABE0", paddingRight: "5px" }}>Market Cap: <span style={{ color: 'white' }}>$</span></span>
                        {
                            marketCap ? millify(marketCap, { precision: 2 })
                                :
                                <Skeleton sx={{ bgcolor: '#8e8e8e' }} width={100} height={20} variant="rounded"
                                />

                        }</div>
                    <div className={classes["row-2-item"]} style={{ display: 'flex' }}><span style={{ color: "#43ABE0", paddingRight: "5px" }}>Price USD: <span style={{ color: 'white' }}>$</span></span>
                        {
                            priceUsd ? millify(priceUsd, { precision: 10 })
                                :
                                <Skeleton sx={{ bgcolor: '#8e8e8e' }} width={100} height={20} variant="rounded"
                                />
                        }</div>
                    <div className={classes["row-2-item"]} style={{ display: 'flex' }}> <span style={{ color: "#43ABE0", paddingRight: "5px" }}>Price ETH: <span style={{ color: 'white' }}>$</span></span>
                        {
                            priceUsd ? millify(priceUsd / priceEth, { precision: 10 })
                                :
                                <Skeleton sx={{ bgcolor: '#8e8e8e' }} width={100} height={20} variant="rounded"
                                />
                        }</div>
                </div>
                <div className={classes["row-3"]}>
                    <div className={classes["row-3-item"]}>
                        <div><span style={{ color: "#43ABE0", paddingRight: "5px" }}>Your {tokenName} Balance:</span> {
                            tokenBalance ? millify(tokenBalance, { precision: 5 })
                                :
                                <Skeleton sx={{ bgcolor: '#8e8e8e' }} width={100} height={20} variant="rounded"
                                />
                        } {tokenName}</div>
                        <div><span style={{ color: "#43ABE0", paddingRight: "5px" }}>Injected to Treasury:</span>{
                            treasuryAmount ? millify(treasuryAmount, { precision: 5})
                            :
                            <Skeleton sx={{ bgcolor: '#8e8e8e' }} width={100} height={20} variant="rounded"
                                />
                            }</div>
                    </div>
                    <div className={classes["row-3-item"]}>
                        <div onClick={() => setModalVisible(true)} className={whiteOutline ? classes["inject-btn--white"] : classes["inject-btn"]}>Inject To Treasury</div>
                        <InjectModal tokenName={tokenName} tokenAddress={tokenAddress} tokenBalance={tokenBalance}  modalVisible={modalVisible} setModalVisible={setModalVisible} treasuryAmount={treasuryAmount} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default TokenInfo;
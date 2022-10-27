import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InjectToken from './Components/InjectToken/InjectToken';
import Navbar from './Components/Navbar/Navbar';
import TokenInfo from './Components/TokenInfo/TokenInfo';
import { getTokenInfo } from './redux/action/tokenListAction';
import './App.css';


function App() {
  const dispatch = useDispatch();
  const tokenList = useSelector((state) => state.tokenList.tokenInfo);
  console.log("tokenList:::", tokenList)
  useEffect(() => {
    let tempToken = localStorage.getItem("tokenLists");
    console.log('tempToken: ', tempToken)
    dispatch(getTokenInfo(JSON.parse(tempToken) || []))
  }, [dispatch])
  return (
    <div className="App">
      <Navbar />
      <InjectToken />
      {
        tokenList &&
        tokenList?.map((info, index) => (
          index % 2 === 0
            ?
            <TokenInfo key={index} whiteOutline={true} id={index} tokenName={info.name} tokenAddress={info.address} />
            : <TokenInfo key={index} tokenName={info.name} tokenAddress={info.address} id={index} />
        ))
      }
    </div>
  );
}

export default App;

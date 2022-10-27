// interface types {
//   tokenName: string,
//   tokenAddress: string,
//   liquidity: string,
//   marketCup: string,
//   priceUsd: string,
//   priceEth: string,
//   yourDustBalance: string,
//   injectTreasury: string,
// }

// interface objectType {
//   dataObject: types[],
//   address: string,
// }

// let initializeState: objectType  = {
//   dataObject: [],
//   address: ''
// }

let initializeState = {
  tokenInfo: [],
}

const reducer = (state = initializeState, action) => {
  switch(action.type){
    
    case 'GET_TOKEN_INFO':
      return{
        ...state, tokenInfo:  [...action.payload]
      }

    case 'IMPORT_TOKEN':
      let localTokenList = localStorage.getItem("tokenLists");
      if (localTokenList !== null) {
        let temp = JSON.parse(localTokenList)
        localStorage.setItem("tokenLists", JSON.stringify([...temp, ...action.payload]));
      } else {
        let temp = action.payload;
        localStorage.setItem("tokenLists", JSON.stringify([...temp]));
      }
      return{
        ...state, tokenInfo: [...state.tokenInfo, ...action.payload]
      }

    case 'DELETE_TOKEN':
      return{
        ...state, tokenInfo: [...action.payload] 
      }

    default:
      return state;
  }
}

export default reducer;

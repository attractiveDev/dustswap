export const importToken = (value) => {
  return{
    type:'IMPORT_TOKEN',
    payload: value
  }
}

export const deleteToken = (value) => {
  return{
    type:'DELETE_TOKEN',
    payload: value,
  }
}

export const getTokenInfo = (value) => {
  return{
    type:"GET_TOKEN_INFO",
    payload: value,
  }
}
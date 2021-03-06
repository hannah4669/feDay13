import Axios from 'axios'
import { API_URL, API_URL_SQL } from '../../helpers/idrformat'
import {ADDCART, ADDHISTORY} from './../Type'

export const LoginFunc=(obj, cart)=>{
    return {
        type: 'LOGIN',
        payload: obj,
        cart: cart
    }
}

export const Clearfunc=()=>{
    return {
        type: 'CLEAR'
    }
}

export const AddCartAction = (cart) => {
    return {
        type: ADDCART,
        cart: cart
    };
}

// export const AddHistoryAction = (history) => {
//     return {
//         type: ADDHISTORY,
//         history: history
//     }
// }


export const LoginThunk=(username, password)=>{
    return (dispatch)=>{
        dispatch({type:'LOADING'})
        Axios.post(`${API_URL_SQL}/auth/login`,{
            username,
            password
        })
        .then((res)=>{
            localStorage.setItem('id',res.data.datauser.id)
            dispatch({type:'LOGIN', payload:res.data.datauser, cart: res.data.cart})
        }).catch((err)=>{
            dispatch({type:'Error', payload:err.response.data.message})
        })
        // Axios.get(`${API_URL}/users`,{
        //     params:{
        //         username:username,
        //         password:password
        //     }
        // }).then((res)=>{
        //     if(res.data.length){
        //         Axios.get(`${API_URL}/carts`,{
        //             params:{
        //                 userId: res.data[0].id,
        //                 _expand:'product'
        //             }
        //         }).then((res1)=>{
        //             localStorage.setItem('id',res.data[0].id)
        //             dispatch({type:'LOGIN', payload:res.data[0], cart: res1.data})
        //         }).catch((err)=>{
        //             dispatch({type:'Error', payload: 'servernya error'})
        //         })
        //     }else{
        //         dispatch({type:'Error', payload:'kayaknya nb dr redux'})
        //     }
        // }).catch((err)=>{
        //     dispatch({type:'Error', payload: 'servernya error'})
        // })
    }
}

export const LogoutThunk = (username,password) => {
    return ( dispatch )=>{
        Axios.get(`${API_URL}/users`,{
            params: {
                username: username,
                password: password
            }
        }).then((res)=>{
            localStorage.removeItem('id', res.data[0].id)
            alert('berhasil logout')
            dispatch({type: 'LOADING'})
        }).catch((err)=>{
            dispatch({type:'Error', payload: 'servernya error paan nih'})
        })
    };
}
 
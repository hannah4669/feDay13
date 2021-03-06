import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import Header from '../../component/Header';
import Axios from 'axios'
import { API_URL, API_URL_SQL, priceFormatter } from '../../helpers/idrformat';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import {TableFooter} from '@material-ui/core'
import NotFound from './../notfound';
import ButtonUi from './../../component/button'
import {Modal, ModalHeader, ModalBody, ModalFooter, Button, CustomInput} from 'reactstrap'
import {AddCartAction} from './../../redux/Actions'
import {MdDeleteForever} from 'react-icons/md'
import {BiEditAlt} from 'react-icons/bi'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

class Cart extends Component {
    state = { 
        cart:[],
        isOpen: false,
        isEditQty: false,
        pilihan: 0,
        indexEdit: 0,
        bukti: createRef(),
        cc: createRef(),
        qtyEdit: createRef(),
        idtrans: 0,
        buktitrans: null
     }

    componentDidMount(){
        // Axios.get(`${API_URL}/carts?userId=${this.props.id}&_expand=product`)
        Axios.get(`${API_URL_SQL}/trans/getCart`,{
            params:{
                userid: this.props.id
            }
        })
        .then((res)=>{
            console.log(this.props.cart)
            console.log(res.data)
            this.setState({cart:res.data, idtrans: res.data[0].idtrans})
            // alert('Berhasil masukkan ke cart')
        }).catch((err)=>{
            console.log(err)
        })
    }

    onDeleteClick=(index, id)=>{
        // const {nama} =this.state.datamurid[index]
        MySwal.fire({
          title: `Are you sure want to delete ${this.state.cart[index].product.namatrip} ?`,
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if (result.value) {
            // console.log(id)
            Axios.delete(`${API_URL}/carts/${id}`)
            .then(()=>{
                Axios.get(`${API_URL}/carts`,{
                    params:{
                        userId: this.props.id,
                        _expand:'product'
                    }
                })
                .then((res)=>{
                    MySwal.fire(
                      'Deleted!',
                      'Your file has been deleted.',
                      'success'
                    )
                    this.setState({cart:res.data})
                    // alert('Berhasil masukkan ke cart')
                }).catch((err)=>{
                    console.log(err)
                })
            }).catch((err)=>{
              console.log(err)
            })
          }
        })
    }

    dateformat=()=>{
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
    
        today = yyyy + '-' + mm + '-' + dd;
        return today
    }

    renderTotalHarga=()=>{
        var total= this.state.cart.reduce((total, num)=>{
            return total + (num.harga * num.qty)
        },0)

        return total
    }

    renderCart=()=>{
        return this.state.cart.map((val,index)=>{
            return (
                <TableRow key={val.id}>
                    <TableCell>{index+1}</TableCell>
                    <TableCell>{val.namaproduct}</TableCell>
                    <TableCell>
                        <div style={{maxWidth:'200px'}}>
                            <img width='100%' heigth='100%' src={API_URL_SQL + val.banner} alt={val.namaproduct}/>
                        </div>
                    </TableCell>
                    <TableCell>{val.qty}</TableCell>
                    <TableCell>{priceFormatter(val.harga)}</TableCell>
                    <TableCell>{priceFormatter(val.harga * val.qty)}</TableCell>
                    <TableCell>
                        <span style={{fontSize:30}} onClick={()=>this.onDeleteClick(index, val.id)} className='text-danger mr-3'><MdDeleteForever/></span>
                        <span style={{fontSize:30}} onClick={()=>this.onEditClick(index)} className='text-primary ml-3'><BiEditAlt/></span>
                    </TableCell>
                </TableRow>
            )
        })
    }

    // transaction ada id, status, userId, tanggalPembayaran, metode, bukti pembayaran
    // transactionDetails ada id, transactionId, productId, price, qty

    onBayarClick=()=>{
        const {pilihan} = this.state
        if(pilihan === '1'){ // via transfer
            this.onBayarPakeBukti()
        }else if (pilihan === '2'){
            if (this.cekCreditCard(this.state.cc.current.value)){
                alert('credit card valid')
                this.onBayarPakeCC()
            }else{
                alert('Maaf Credit Card anda tidak valid')
            }
            
        }else{
            alert ('Pilih dulu metode pembayaran')
        }
    }

    cekCreditCard=(input)=>{
        var angka = 0
        var output = 0
        var y = input
        var a
        do {
            a = y % (10)
            var b
            y = (y - a)/10
            if(angka % 2 == 1){
                a *= 2
                if(a > 9){
                    b = a%10
                    output += (b+1)
                }else{
                    output += a
                }

            }else{
                output += a
            }
            angka ++
        } while (y>0);
        if(output % 10 == 0){
            return true
        }else{
            return false
        }
    }

    onBayarPakeCC=()=>{
        Axios.post(`${API_URL_SQL}/trans/bayarcc`,{
            idtrans: this.state.idtrans,
            nomercc: this.state.cc.current.value,
            datacart: this.state.cart
        }, {
            headers: {
                'Authorization' : `Bearer ${this.props.token}`
            }
        }).then((res)=>{
            if (res.data === 'berhasil'){
                this.props.AddCartAction([])
                this.setState({cart:[], isOpen: false})
            }
        }).catch((err)=>{
            console.log(err)
        })
        // Axios.post(`${API_URL}/transactions`,{
        //     status: 'Completed',
        //     userId: this.props.id,
        //     tanggalPembayaran: this.dateformat(),
        //     metode: 'cc',
        //     buktiPembayaran: this.state.cc.current.value
        // }).then((res)=>{
        //     var arr = []
        //     this.state.cart.forEach((val)=>{
        //         arr.push(Axios.post(`${API_URL}/transactionDetails`, {
        //             transactionId: res.data.id,
        //             productId: val.product.id,
        //             namatrip: val.product.namatrip,
        //             gambar: val.product.gambar,
        //             price: parseInt(val.product.harga),
        //             qty: val.qty
        //         }))
        //     })
        //     Axios.all(arr).then((res1)=>{
        //         var deleteArr = []
        //         this.state.cart.forEach((val)=>{
        //             deleteArr.push(Axios.delete(`${API_URL}/carts/${val.id}`))
        //         })
        //         Axios.all(deleteArr)
        //         .then(()=>{
        //             Axios.get(`${API_URL}/carts`,{
        //                 params:{
        //                     userId: this.props.id,
        //                     _expand:'product'
        //                 }
        //             })
        //             .then((res3)=>{
        //                 console.log(res3.data)
        //                 this.props.AddCartAction([])
        //                 this.setState({cart:res3.data, isOpen:false})
                        
        //             }).catch((err)=>{
        //                 console.log(err)
        //             })
        //         }).catch((Err)=>{
        //             console.log(Err)
        //         })
        //     }).catch((err)=>{
        //         console.log(err)
        //     })
        // }).catch((err)=>{
        //     console.log(err)
        // })
    }

    onBayarPakeBukti=()=>{
        var formData = new FormData()
        var options = {
            headers: {
                'Content-type': 'multipart/form-data',
                'Authorization' : `Bearer ${this.props.token}`
            },
            params: {
                userid: this.props.id
            }
        }
        formData.append('bukti', this.state.buktitrans)
        formData.append('data', JSON.stringify({idtrans: this.state.idtrans}))
        Axios.post(`${API_URL_SQL}/trans/bayarbukti`, formData, options)
        .then((res)=>{
            if (res.data === 'berhasil'){
                this.props.AddCartAction([])
                this.setState({cart:[], isOpen: false})
            }
        }).catch((err)=>{
            console.log(err)
        })
        // Axios.post(`${API_URL}/transactions`,{
        //     status: 'WaitingAdmin',
        //     userId: this.props.id,
        //     tanggalPembayaran: this.dateformat(),
        //     metode: 'upload',
        //     buktiPembayaran: this.state.bukti.current.value
        // }).then((res)=>{
        //     var arr = []
        //     this.state.cart.forEach((val)=>{
        //         arr.push(Axios.post(`${API_URL}/transactionDetails`, {
        //             transactionId: res.data.id,
        //             productId: val.product.id,
        //             namatrip: val.product.namatrip,
        //             gambar: val.product.gambar,
        //             price: parseInt(val.product.harga),
        //             qty: val.qty
        //         }))
        //     })
        //     Axios.all(arr).then((res1)=>{
        //         var deleteArr = []
        //         this.state.cart.forEach((val)=>{
        //             deleteArr.push(Axios.delete(`${API_URL}/carts/${val.id}`))
        //         })
        //         Axios.all(deleteArr)
        //         .then(()=>{
        //             Axios.get(`${API_URL}/carts`,{
        //                 params:{
        //                     userId: this.props.id,
        //                     _expand:'product'
        //                 }
        //             })
        //             .then((res3)=>{
        //                 console.log(res3.data)
        //                 this.props.AddCartAction([])
        //                 this.setState({cart:res3.data, isOpen:false})
                        
        //             }).catch((err)=>{
        //                 console.log(err)
        //             })
        //         }).catch((Err)=>{
        //             console.log(Err)
        //         })
        //     }).catch((err)=>{
        //         console.log(err)
        //     })
        // }).catch((err)=>{
        //     console.log(err)
        // })
    }

    oninputfilechange=(e)=>{
        if(e.target.files[0]){
            this.setState({buktitrans:e.target.files[0]})
        }else{
            // console.log('hapus')
            this.setState({buktitrans:null})
        }
    }

    onEditClick=(index)=>{
        this.setState({indexEdit: index})
        this.setState({isEditQty: true})
    }

    onSaveEditClick=(index, id)=>{
        var qtyNew = this.state.qtyEdit.current.value
          Axios.patch(`${API_URL}/carts/${id}`, {
              qty: parseInt(qtyNew)
          })
          .then((res)=>{
            Axios.get(`${API_URL}/carts`)
            .then((res1)=>{
                this.setState({cart:res1.data})
                this.setState({indexEdit: index})
                this.setState({isEditQty: false})
            }).catch((err)=>{
                console.log(err)
            }).finally(()=>{
                window.location.reload()

            })
          }).catch((err)=>{
            console.log(err)
          })
    }

    onCheckOutClick=()=>{
        this.setState({isOpen: true})
        // Axios.post(`${API_URL}/transactions`,{
        //     status: 'WaitingPayment',
        //     checkoutDate: new Date().getTime(),
        //     userId: this.props.id,
        //     tanggalPembayaran: ''
        // }).then((res)=>{
        //     var arr = []
        //     this.state.cart.forEach((val)=>{
        //         arr.push(Axios.post(`${API_URL}/transactionDetails`, {
        //             transactionId: res.data.id,
        //             productId: val.product.id,
        //             price: parseInt(val.product.harga),
        //             qty: val.qty
        //         }))
        //     })
        //     Axios.all(arr).then((res1)=>{
        //         var deleteArr = []
        //         this.state.cart.forEach((val)=>{
        //             deleteArr.push(Axios.delete(`${API_URL}/carts/${val.id}`))
        //         })
        //         Axios.all(deleteArr)
        //         .then(()=>{
        //             Axios.get(`${API_URL}/carts`,{
        //                 params:{
        //                     userId: this.props.id,
        //                     _expand:'product'
        //                 }
        //             })
        //             .then((res3)=>{
        //                 console.log(res3.data)
        //                 this.setState({cart:res3.data})
                        
        //             }).catch((err)=>{
        //                 console.log(err)
        //             })
        //         }).catch((Err)=>{
        //             console.log(Err)
        //         })
        //     }).catch((err)=>{
        //         console.log(err)
        //     })
        // }).catch((err)=>{
        //     console.log(err)
        // })
    }

    render() { 
        if(this.props.role === 'user'){
            return ( 
                <div>
                    <Modal isOpen={this.state.isOpen} toggle={()=>this.setState({isOpen: false})}>
                        <ModalHeader toggle={()=>this.setState({isOpen: false})}>Pembayaran</ModalHeader>
                        <ModalBody>
                            <select onChange={(e)=>this.setState({pilihan:e.target.value})} className='form-control' defaultValue={0}>
                                <option value="0" hidden>Select payment method</option>
                                <option value="1">Via transfer</option>
                                <option value="2">Via Credit Card</option>
                            </select>
                            {
                                this.state.pilihan==2 ?
                                <input className='form-control' ref={this.state.cc} placeholder='masukkan cc'/>
                                :
                                this.state.pilihan==1?
                                <CustomInput className='form-control' onChange={this.oninputfilechange} type='file'   label={this.state.buktitrans?this.state.buktitrans.name:'Select bukti'}/>
                                :
                                null
                            }
                            <div>
                                TotalHarga {priceFormatter(this.renderTotalHarga())}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <ButtonUi onClick={this.onBayarClick}>
                                Bayar
                            </ButtonUi>
                        </ModalFooter>
                    </Modal>
                    {
                    this.state.cart.length ?
                    <Modal isOpen={this.state.isEditQty} toggle={()=>this.setState({isEditQty: false})}>
                        <ModalHeader toggle={()=>this.setState({isEditQty: false})}>Edit quantity {this.state.cart[this.state.indexEdit].namaproduct}</ModalHeader>
                            <ModalBody>
                                <input type='text' defaultValue={this.state.cart[this.state.indexEdit].qty} ref={this.state.qtyEdit} placeholder='Masukkan qty' className='form-control mb-2'/>
                                
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onClick={()=>this.onSaveEditClick(this.state.indexEdit, this.state.cart[this.state.indexEdit].id)} >Save</Button>{' '}
                                <Button color="secondary" onClick={()=>this.setState({isEditQty: false})}>Cancel</Button>
                        </ModalFooter>
                    </Modal>
                    : null
                    }
                    <Header/>
                    <div className='pt-3' style={{paddingLeft:'5%', paddingRight:'5%'}}>
                        <Paper >
                            <TableContainer >
                                <Table stickyHeader aria-label="sticky table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>No.</TableCell>
                                            <TableCell>Nama Trip</TableCell>
                                            <TableCell style={{width:'200px'}}>Gambar</TableCell>
                                            <TableCell>Jumlah</TableCell>
                                            <TableCell>Harga</TableCell>
                                            <TableCell>Subtotal Harga</TableCell>
                                            <TableCell>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {this.renderCart()}
                                    </TableBody>
                                    <TableFooter>
                                        <TableCell colSpan={4}></TableCell>
                                        <TableCell style={{fontWeight:'700', color:'black', fontSize:20}}>Subtotal Harga</TableCell>
                                        <TableCell style={{fontWeight:'700', color:'black', fontSize:20}}>{priceFormatter(this.renderTotalHarga())}</TableCell>
                                    </TableFooter>
                                </Table>
                            </TableContainer>
                            <ButtonUi onClick={this.onCheckOutClick} className='my-3'>
                                Checkout
                            </ButtonUi>
                        </Paper>

                    </div>
                </div>
             );

        }else{
            return <NotFound/>
        }
    }
}

const MapstatetoProps=({Auth})=>{
    return {
      ...Auth, role: Auth.role
    }
}

export default connect(MapstatetoProps, {AddCartAction}) (Cart);
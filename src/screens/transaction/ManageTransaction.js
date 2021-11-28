import React, { useEffect , useState} from 'react';
import {useColorScheme, View, Text, StyleSheet, Image, Alert, TouchableOpacity, TextInput, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';

// components
import Constant from '../../components/Constants';
import MainButton from '../../components/MainButton';

//import library
import { Icon } from 'react-native-elements';
import Modal from 'react-native-modal';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ManageTransaction = props=>{

    //check user type
    const [userRole, setUserRole] = useState('Admin')
    
    // set user role
    useEffect(() => {  
        LoadUsers()
    }, []);

    // loading user from local storage
    const LoadUsers = async ()=>{
        AsyncStorage.getItem("ROLE").then(value => {
            setUserRole(value)
        }).catch((error)=> console.log(error))
     }

    //color scheme
    const colorScheme = useColorScheme();

    //delte modal
    const [deleteModal, setDeleteModal] = useState(false)
    
    // when page is ready
    const [ready, setready] = useState(false)

    //today date
    var today = (require('moment')().format('DD MMMM YYYY'))

    //activity indicator
    const [loading, setLoading] = useState(false)

    // marketplace
    const [marketplace, setMarketplace] = useState('')

    //on editmode
    const [editMode, setEditMode] = useState(false)

    // data
    const [userName, setUserName] = useState('')
    const [id, setId] = useState(0)
    const [no, setNo] = useState('')
    const [date, setDate] = useState(new Date())
    const [dateString, setDateString] = useState(today)
    const [customer, setCustomer] = useState('')
    const [item, setItem] = useState([])
    const [totalPenjualan, setTotalPenjualan] = useState(0)
    const [totalModal, setTotalModal] = useState(0)
    const [catatan, setCatatan] = useState ('')
    const [totalProfit, setTotalProfit] = useState(0)
    const [powerMerchant, setPowerMerchant] = useState(0)
    const [editedAt, setEditedAt] = useState(null)
    const [editedBy, setEditedBy] = useState('')

    //  modal add item
    const [itemKey, setItemKey] = useState('')
    const [onItemClicked, setOnItemClicked] = useState(false)
    const [itemName, setItemName] = useState('')
    const [modal, setModal]= useState(0)
    const [jual, setJual]= useState(0)
    const [itemId, setItemId]= useState(0)
    const [quantity, setQuantity] = useState('1')
    const [isModalVisible, setModalVisible]= useState(false)
    const [modalPreview, setModalPreview]= useState('')
    const [jualPreview, setJualPreview]= useState('')

    // item dropdown //
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([]);

    //date picker
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false)

    const handleConfirm = (date) => {
        var dateStr = (require('moment')(date).format('DD MMMM YYYY'))
        setDatePickerVisibility(false)
        setDate(date)
        setDateString(dateStr)

        if(!editMode){
            countPacket(date, marketplace)
        }
    };

    // Kurir
    const [percentageKurir, setPercentageKurir] = useState('0.0');
    const [feeKurir, setFeeKurir] = useState(0);
    const [feeKurirPreview, setFeeKurirPreview] = useState('Rp 0');
    const [openKurir, setOpenKurir] = useState(false);
    const [valueKurir, setValueKurir] = useState('');
    const [itemsKurir, setItemsKurir] = useState([
      {label: 'JNE', value: 'jne'},
      {label: 'JNT', value: 'jnt'},
      {label: 'Sicepat', value: 'sicepat'},
      {label: 'Grab', value: 'grab'},
      {label: 'Gosend', value: 'gosend'},
      {label: 'Others', value: 'others'}
    ]);

    // Biaya Tambahan
    const [additionDesc, setAdditionDesc] = useState('')
    const [additionCost, setAdditionCost] = useState(0)
    const [additionCostPreview, setAdditionCostPreview] = useState('')

    //set marketplace
    useEffect(()=>{
        if (props.route.params?.marketplace) {
            setMarketplace(props.route.params.marketplace)
            getProduct()

            if(props.route.params?.item_id){
                setEditMode(true)
                setId(props.route.params.item_id)
                fetchData(props.route.params.item_id)
            } else {
                countPacket(date, props.route.params.marketplace)
            }
        }
     },[props.route.params]);

    // to get produk list
    const getProduct = async ()=>{
        const URL = Constant.BASE_URL+"/product_get";

        try{
            const response = await fetch(URL, {
                method: "POST",
                body: JSON.stringify({
                    id:1
                   }),
                headers:{
                    'Accept': 'application/json',
                    "Content-Type" : "application/json"
                }
            });

            if(response.status !=200){
                throw new Error("Terjadi Kesalahan, silahkan hubungi Steviani");

            } else {
                const responseData = await response.json();
                if (responseData.status != 200){
                    console.log('no product found')
                } else {
                    var data = responseData.data 
                    var itemList =[]
                    data.map((item)=>{
                        var object = {
                            label: item.name,
                            value: item.id.toString()+'/*/'+item.modal.toString()+'/*/'+item.jual.toString()+'/*/'+item.name,
                        }
                        itemList = [...itemList, object]
                    }) 
                    setItems(itemList)
                }
            }
        }catch(error){
            Alert.alert('Tidak ada Koneksi Internet');
        }
    }

    // to get transaction Detail
    const fetchData = async (item_id)=>{
        const URL = Constant.BASE_URL+"/transaction_one";

        try{
            const response = await fetch(URL, {
                method: "POST",
                body: JSON.stringify({
                    id : item_id
                   }),
                headers:{
                    'Accept': 'application/json',
                    "Content-Type" : "application/json"
                }
            });

            if(response.status !=200){
                throw new Error("something is wrong!");

            } else {
                const responseData = await response.json();
                if (responseData.status != 200){
                    Alert.alert('Terjadi kesalahan, silahkan hubungi steviani')
                } else {

                    var data = responseData.data
                    var date = new Date(data.created_at)
                    var dateStr = require('moment')(date).format('DD MMMM YYYY')

                    var edited_at = require('moment').utc(data.edited_at).local().format('DD MMM YY, LT');

                    setEditedAt(edited_at)
                    setEditedBy(data.edited_by)

                    setValueKurir(data.delivery)
                    setNo(data.no)
                    setDate(date)
                    setDateString(dateStr)
                    setCustomer(data.customer_name)
                    setItem(JSON.parse(data.item))
                    setPercentageKurir(data.delivery_percentage)
                    setFeeKurir(data.delivery_fee)
                    setFeeKurirPreview (formatRupiah(data.delivery_fee))
                    setAdditionCostPreview (formatRupiah(data.additional_cost))
                    setAdditionCost(data.additional_cost)
                    setAdditionDesc(data.additional_description)
                    setCatatan(data.catatan)
                    setPowerMerchant(data.pm_pro)
                    setTotalModal(data.total_modal)
                    setTotalPenjualan(data.total_penjualan)
                    setTotalProfit(data.total_profit)
                    setready(true)
                }
            }
        }catch(error){
            Alert.alert('Tidak ada Koneksi Internet');
        }
    }

    //to get Packet Number
    const countPacket = async (date, marketplace)=>{
        var start_month = require('moment')(date).startOf('month').format('YYYY-MM-DD');
        var end_month = require('moment')(date).endOf('month').format('YYYY-MM-DD');
        const URL = Constant.BASE_URL+"/count_packet";

        try{
            const response = await fetch(URL, {
                method: "POST",
                body: JSON.stringify({
                    marketplace : marketplace,
                    start_month : start_month,
                    end_month : end_month
                   }),
                headers:{
                    'Accept': 'application/json',
                    "Content-Type" : "application/json"
                }
            });

            if(response.status !=200){
                throw new Error("something is wrong!");

            } else {
                const responseData = await response.json();
                if (responseData.status != 200){
                    console.log('failed')
                } else {
                    var resData = responseData.data
                    var data 
                    if (resData.length == 0){
                        data = '001'
                    } else {
                        var arr = (resData[0].no).split('-')
                        data = (Number(arr[1]) + 1).toString()

                        switch (data.length) {
                        case 1:
                            data = '00'+ data
                            break;
                        case 2:
                            data = '0'+ data
                            break;
                        default:
                            break;
                        }
                    }    
                    
                    var temp = marketplace.charAt(0)+'-'+data
                    setNo(temp)
                    setready(true)
                }
            }
        }catch(error){
            setLoading(false)
            Alert.alert('Tidak ada Koneksi Internet');
        }
    }

    // to update total modal and total penjualan
    useEffect(()=>{
        var totj = 0
        var totm = 0
        item.map((item)=>{
            totj += item.jual * item.quantity
            totm += item.modal * item.quantity
        })

        setTotalPenjualan(totj)
        setTotalModal(totm)

        // biaya kurir
        var fee = (Number(percentageKurir) / 100) * totj
        if (fee > 10000) fee= 10000
        setFeeKurir(Math.round(fee))
        setFeeKurirPreview(formatRupiah(Math.round(fee)))

        // power Merchant
        if (marketplace=='Tokopedia'){
            var pm =Math.round((1.5/100) * totj)
            setPowerMerchant(pm)
        } 

        //total profit
        var profit
        if (marketplace === 'Tokopedia'){
            profit = totj - totm - Math.round(fee) - additionCost - pm
        } else {
            profit = totj - totm - Math.round(fee) - additionCost
        }
        setTotalProfit(profit)

     },[item]);

    // to format to rupiah
    const formatRupiah = (number) =>{
        let n = number
        let balance = n.toString()
        if (balance.length>3 ){
            if(balance.length >6){
                if(balance.length >9){
                    balance =(balance.slice(0,-9)+'.'+balance.slice(-9,-6)+'.'+balance.slice(-6,-3)+'.'+balance.slice(-3))
                }else {
                    balance =(balance.slice(0,-6)+'.'+balance.slice(-6,-3)+'.'+balance.slice(-3))
                } 
            }else {
                balance =(balance.slice(0,-3)+'.'+balance.slice(-3))
            }
        } else {
            balance =(balance)
        } 
        return 'Rp '+balance
    }

    //render list of item
    const ItemList = ({item}) =>{
        return (
            <TouchableOpacity style={styles.itemContainer} onPress={()=>{itemClicked(item)}}>
                <Text style={{fontSize: Constant.TERTIARY_FONT_SIZE}}>({item.quantity}) {item.name}</Text>
                
                {/* harga modal */}
                {userRole != 'Admin' &&
                <View style={styles.itemPrice}>
                    <Text style={styles.smallGreyText}>Harga Modal / Item</Text>
                    <Text style={styles.smallText}>{formatRupiah(item.modal)}</Text>
                </View>
                }

                {/* harga jual */}
                <View style={styles.itemPrice}>
                    <Text style={styles.smallGreyText}>Harga Jual / Item</Text>
                    <Text style={styles.smallText}>{formatRupiah(item.jual)}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    //when item is clicked
    const itemClicked = (item) =>{
        setOnItemClicked(true)
        setValue(item.item_value)
        setModalPreview(formatRupiah(item.modal))
        setJualPreview(formatRupiah(item.jual))
        setModal(item.modal)
        setJual(item.jual)
        setQuantity((item.quantity).toString())
        setItemId(item.item_id)
        setItemKey(item.item_key)
        setItemName(item.name)
        setModalVisible(true)
    }

    //when closing modal
    const closeModal = () =>{
        setModalVisible(false)
        setOpen(false)
        setValue(null)
        setModalPreview('')
        setJualPreview('')
        setModal(0)
        setJual(0)
        setQuantity('1')
        setItemId(0)
        setItemName('')
        setOnItemClicked(false)
        setItemKey('')
    }

    // to handle of money input
    const handleMoneyInput = (val, type)=>{
        var amount = val.replace(/[^0-9]/g, '')
        if (type == 'jual') {
            setJualPreview(formatRupiah(amount))
            setJual(amount ? amount : 0)
        } else if (type == 'modal'){
            setModalPreview(formatRupiah(amount))
            setModal(amount ? amount : 0)
        } else {
            setAdditionCostPreview(formatRupiah(amount))
            setAdditionCost(amount ? amount : 0)

            //total profit
            var profit
            if (marketplace === 'Tokopedia'){
                profit = totalPenjualan - totalModal - feeKurir - (amount ? amount : 0)  - powerMerchant
            } else {
                profit = totalPenjualan - totalModal - feeKurir - (amount ? amount : 0) 
            }
            setTotalProfit(profit)

        }
    }

    // to handle quantity
    const handleQty = (val)=>{
        var amount = val.replace(/[^0-9]/g, '')
        setQuantity (amount)
    }
    
    //when user choose item
    const handlePickItem = (val) =>{
        if (val ){
        var arr = val.split('/*/')
        var item_id = Number(arr[0])
        var modal = Number(arr[1])
        var jual = Number(arr[2])
        var name = arr[3]
        
        setModalPreview(formatRupiah(modal))
        setJualPreview(formatRupiah(jual))
        setItemId(item_id)
        setModal(modal)
        setJual(jual)
        setItemName(name)
        }
    }

    //when user remove item
    const handleRemoveItem = () =>{
        const itemIndex = item.findIndex((item) => item.item_key === itemKey)
        item.splice(itemIndex, 1)
        setItem([...item])
        closeModal()
    }

    //when user edit item
    const handleEditItem = () =>{
        if (itemId == 0 && itemName ==""){
            Alert.alert("Silahkan pilih produk")
        } else if (Number(quantity) == 0){
            Alert.alert("Masukan jumlah item")
        } else {
            const itemIndex = item.findIndex((item) => item.item_key === itemKey)
            item[itemIndex].item_id = itemId
            item[itemIndex].item_value = value
            item[itemIndex].name = itemName
            item[itemIndex].modal = modal
            item[itemIndex].jual = jual
            item[itemIndex].quantity = Number(quantity)

            setItem([...item])
            closeModal()
        }   
        
    }

    //when user click add
    const handleAdd = ()=>{
        if (itemId == 0 && itemName ==""){
            Alert.alert("Silahkan pilih produk")
        } else if (Number(quantity) == 0){
            Alert.alert("Masukan jumlah item")
        } else {
            var randId = Math.random();
            setItemKey(randId.toString())
            var object = {
                item_key : randId.toString(),
                item_value : value,
                item_id : itemId,
                name : itemName,
                modal : modal,
                jual : jual,
                quantity : Number(quantity)
            }
            setItem([...item, object])
            closeModal()
        }   
    }

    // handle percentage
    const handlePercentage = (val) =>{
        var percentage = val.replace(/[^0-9.]/g, '')
        if (percentage.split(".").length > 2) return

        
        setPercentageKurir(percentage)

        // biaya kurir
        var fee = (Number(percentage) / 100) * totalPenjualan
        if (fee > 10000) fee= 10000
        setFeeKurir(Math.round(fee))
        setFeeKurirPreview(formatRupiah(Math.round(fee)))

        //total profit
        var profit
        if (marketplace === 'Tokopedia'){
            profit = totalPenjualan - totalModal - Math.round(fee) - additionCost - powerMerchant
        } else {
            profit = totalPenjualan - totalModal - Math.round(fee) - additionCost
        }
        setTotalProfit(profit)
    }

    //handle save button
    const handleSaveTrans= ()=>{
        if (customer == '') {
            Alert.alert('Masukkan Nama Pembeli')
        } else if (item.length == 0) {
            Alert.alert('Silahkan Pilih Item')
        } else if (valueKurir == '') {
            Alert.alert('Silahkan Pilih Kurir Pengantaran')
        } else {
            if(editMode){
                editTransaction()
            } else {
                addTransaction()

            }
        }
    }

    // edit existing transaction
    const editTransaction = async () =>{
        setLoading(true)
        //created at and edited at
        var created_at = require('moment')(date).format('YYYY-MM-DD');
        var edited_at = require('moment').utc().format('YYYY-MM-DD HH:mm:ss')  

        // get user firstname
        var user_name
        await AsyncStorage.getItem("FIRSTNAME").then(value => {
            user_name = value
        }).catch((error)=> console.log(error))
        
        //final object to store into database
        var object = {
            id : id,
            created_at: created_at,
            edited_at : edited_at,
            edited_by : user_name,
            no : no,
            customer_name : customer,
            delivery : valueKurir,
            delivery_fee : feeKurir,
            delivery_percentage : percentageKurir,
            additional_cost: additionCost,
            additional_description : additionDesc,
            total_profit: totalProfit ,
            total_penjualan: totalPenjualan,
            total_modal: totalModal,
            item: JSON.stringify(item),
            pm_pro: powerMerchant,
            catatan : catatan,
            marketplace : marketplace
        }

        const URL = Constant.BASE_URL+"/transaction_edit";

        try{
            const response = await fetch(URL, {
                method: "POST",
                body: JSON.stringify(object),
                headers:{
                    'Accept': 'application/json',
                    "Content-Type" : "application/json"
                }
            });

            if(response.status !=200){
                setLoading(false)
                throw new Error("Terjadi kesalahan! silahkan hubungi Steviani");

            } else {
                const responseData = await response.json();
                if (responseData.status != 200){
                    setLoading(false)
                    Alert.alert('terjadi kesalahan! silahkan hubungi Steviani')
                } else {

                    console.log('edit success')

                    setLoading(false)

                    var routename = marketplace

                    props.navigation.navigate(
                    {
                        name: routename, 
                        params: {
                            insert: true,
                            date: date
                            },
                        merge : true
                    })
                }
            }
        }catch(error){
            setLoading(false)
            console.log(error)
            Alert.alert('Tidak ada Koneksi Internet');
        }
    }

    // add new transaction
    const addTransaction = async () =>{
        setLoading(true)
        //created at and edited at
        var created_at = require('moment')(date).format('YYYY-MM-DD');
        var edited_at = require('moment').utc().format('YYYY-MM-DD HH:mm:ss')  
        
        // get user firstname
        var user_name
        await AsyncStorage.getItem("FIRSTNAME").then(value => {
            user_name = value
        }).catch((error)=> console.log(error))
        
        //final object to store into database
        var object = {
            created_at: created_at,
            edited_at : edited_at,
            edited_by : user_name,
            no : no,
            customer_name : customer,
            delivery : valueKurir,
            delivery_fee : feeKurir,
            delivery_percentage : percentageKurir,
            additional_cost: additionCost,
            additional_description : additionDesc,
            total_profit: totalProfit ,
            total_penjualan: totalPenjualan,
            total_modal: totalModal,
            item: JSON.stringify(item),
            pm_pro: powerMerchant,
            catatan : catatan,
            marketplace : marketplace
        }

        

        const URL = Constant.BASE_URL+"/transaction_add";

        try{
            const response = await fetch(URL, {
                method: "POST",
                body: JSON.stringify(object),
                headers:{
                    'Accept': 'application/json',
                    "Content-Type" : "application/json"
                }
            });

            if(response.status !=200){
                setLoading(false)
                throw new Error("Terjadi kesalahan! silahkan hubungi Steviani");

            } else {
                const responseData = await response.json();
                if (responseData.status != 200){
                    setLoading(false)
                    Alert.alert('terjadi kesalahan! silahkan hubungi a')
                } else {

                    console.log('insert success')

                    setLoading(false)

                    var routename = marketplace

                    props.navigation.navigate(
                    {
                        name: routename, 
                        params: {
                            insert: true,
                            date: date
                            },
                        merge : true
                    })
                }
            }
        }catch(error){
            setLoading(false)
            console.log(error)
            Alert.alert('Tidak ada Koneksi Internet');
        }
    }

    // remove existing transaction
    const removeTransaction = async () =>{
        setDeleteModal(false)
        setLoading(true)
        const URL = Constant.BASE_URL+"/transaction_remove";

        try{
            const response = await fetch(URL, {
                method: "POST",
                body: JSON.stringify({
                    id : id
                }),
                headers:{
                    'Accept': 'application/json',
                    "Content-Type" : "application/json"
                }
            });

            if(response.status !=200){
                setLoading(false)
                throw new Error("Terjadi kesalahan! silahkan hubungi Steviani");

            } else {
                const responseData = await response.json();
                if (responseData.status != 200){
                    setLoading(false)
                    Alert.alert('terjadi kesalahan! silahkan hubungi Steviani')
                } else {

                    console.log('remove success')

                    setLoading(false)

                    var routename = marketplace
                    
                    props.navigation.navigate(
                    {
                        name: routename, 
                        params: {
                            insert: true,
                            date: date
                            },
                        merge : true
                    })
                }
            }
        }catch(error){
            setLoading(false)
            console.log(error)
            Alert.alert('Tidak ada Koneksi Internet');
        }
    }

    const EmptyState = ()=>{
        return(
            <View style={styles.emptyScreen}>
                <View style={{width:100, height:20, marginTop:20 ,backgroundColor:'#f0f0f0', position:'relative', left:Constant.DEVICE_WIDTH*0.5-66, borderRadius:5}}/>
                <View style={{width:100, height:20, backgroundColor:'#f0f0f0', borderRadius:5, marginTop:20}}/>
                <View style={{width:100, height:20, backgroundColor:'#f0f0f0', borderRadius:5, marginTop:20}}/>
                <View style={{width:'100%', height:35, backgroundColor:'#f9f9f9', borderRadius:10, marginTop:10}}/>  
                <View style={{width:100, height:20, backgroundColor:'#f0f0f0', borderRadius:5, marginTop:20}}/>
                <View style={{width:'100%', height:35, backgroundColor:'#f9f9f9', borderRadius:10, marginTop:10}}/>
                
                <View style={{width:100, height:20, backgroundColor:'#f0f0f0', borderRadius:5, marginTop:20}}/>
                <View style={{width:'100%', height:100, backgroundColor:'#f9f9f9', borderRadius:10, marginTop:10}}/>

                <View style={{width:100, height:20, backgroundColor:'#f0f0f0', borderRadius:5, marginTop:20}}/>
                <View style={{width:'100%', height:35, backgroundColor:'#f9f9f9', borderRadius:10, marginTop:10}}/>

                <View style={{width:100, height:20, backgroundColor:'#f0f0f0', borderRadius:5, marginTop:20}}/>
                <View style={{width:'100%', height:35, backgroundColor:'#f9f9f9', borderRadius:10, marginTop:10}}/>

                <View style={{width:100, height:20, backgroundColor:'#f0f0f0', borderRadius:5, marginTop:20}}/>
                <View style={{width:'100%', height:35, backgroundColor:'#f9f9f9', borderRadius:10, marginTop:10}}/>
                
                <View style={{flexDirection:'row', justifyContent:"space-between"}}>
                <View style={{width:100, height:20, backgroundColor:'#f0f0f0', borderRadius:5, marginTop:20}}/>
                <View style={{width:100, height:20, backgroundColor:'#f0f0f0', borderRadius:5, marginTop:20}}/>
                </View>

            </View>
        )
    }

    return(
        <>
        <View style={styles.screen} >
            <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'? 'height' : null}>
            {ready ?
            <ScrollView style={styles.mainScreen} showsVerticalScrollIndicator={false}>
                {/* header */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>{marketplace}</Text>

                    {/* close button icon */}
                    <TouchableOpacity style={styles.backButton} onPress={()=>{props.navigation.goBack()}}>
                        <Icon
                            name='x'
                            type='feather'
                            color="black"
                            size={30}
                        />
                    </TouchableOpacity>

                    {/* remove item icon */}
                        {editMode && 
                        <TouchableOpacity style={styles.removeButton} onPress={()=>{setDeleteModal(true)}}>
                            <Icon
                                name='trash'
                                type='ionicon'
                                color="#FF8383"
                                size={25}
                            />
                        </TouchableOpacity>
                        }
                </View>

                {/* editted by only on show */}
                {editMode &&
                    <View style={styles.section}>
                        <Text style={[styles.smallGreyText,{textAlign:'center'}]}>
                            Edited by {editedBy} ({editedAt})
                        </Text>
                    </View>
                }

                {/* packet no */}
                <View style={styles.section}>
                    <Text style={styles.boldText}>No. {no}</Text>
                </View>

                {/* date */}
                <View style={styles.section}>
                    <Text>Tanggal</Text>
                    <TouchableOpacity style={styles.collapse} onPress={()=>{setDatePickerVisibility(true)}}>
                        <Text>{dateString}</Text>
                        <Icon
                            name='calendar'
                            type='feather'
                            color= {Constant.PRIMARY_COLOR}
                            size={22}
                        />
                    </TouchableOpacity>
                </View>

                {/* Customer Name */}
                <View style={styles.section}>
                    <Text>Nama Pembeli</Text>
            
                    <TextInput
                        value ={customer}
                        clearButtonMode='while-editing'
                        placeholder= 'Nama'
                        placeholderTextColor={Constant.GREY_PLACEHOLDER}
                        returnKeyType="done"
                        autoCapitalize="words"
                        style={styles.textInput}
                        onChangeText={setCustomer}
                    />
                </View>

                {/* Item */}
                <View style={styles.section}>
                    <Text>Item</Text>

                    {/* render item list */}
                    {item.map((item, index)=> <ItemList key={index} item={item}/>)}
                    
                    {/* total penjualan */}
                    {item.length != 0 &&
                    <View style={[styles.itemPrice,{paddingVertical:10}]}>
                        <Text style={styles.boldText}>Total Penjualan</Text>
                        <Text style={styles.boldText}>{formatRupiah(totalPenjualan)}</Text>
                    </View>
                    }
                    
                    {/* add item icon */}
                    <TouchableOpacity style={styles.addIconContainer} onPress={()=> {setOpen(true); setModalVisible(true)}}>
                        <View style={styles.addIcon}>
                            <Icon
                                name='plus'
                                type='material-community'
                                color="white"
                                size={15}
                            />
                        </View>    
                    </TouchableOpacity>
                </View>

                {/* kurir */}
                <View style={[styles.section]}>
                    <Text>Persenan Kurir</Text>
                    
                    
                    <View style={styles.kurirBottom}>

                    <View style={{ width: openKurir ? '100%':'40%', height: openKurir ? 300 :null}}>
                    <DropDownPicker
                        dropDownDirection="BOTTOM"
                        ArrowUpIconComponent={() => <Icon name='arrow-drop-up' type='material' color="black" size={30}/>}
                        ArrowDownIconComponent={() => <Icon name='arrow-drop-down' type='material' color="black" size={30}/>}
                        placeholder="Bang Gooh"
                        placeholderStyle={{color: Constant.GREY_PLACEHOLDER}}
                        style={[styles.dropdownStyle, {marginTop:0}]}
                        dropDownContainerStyle={[styles.dropDownContainerStyle,{marginTop:0}]}
                        maxHeight={300}
                        open={openKurir}
                        value={valueKurir}
                        items={itemsKurir}
                        setOpen={setOpenKurir}
                        setValue={setValueKurir}
                        setItems={setItemsKurir}
                        onChangeValue={(val)=>{
                            if((val == 'sicepat' || val == 'gosend') && marketplace == 'Tokopedia')
                            {
                                setPercentageKurir('1.5')
                                var fee = (0.015) * totalPenjualan
                                if (fee > 10000) fee= 10000
                                setFeeKurir(Math.round(fee))
                                setFeeKurirPreview(formatRupiah(Math.round(fee)))

                                //total profit
                                var profit
                                if (marketplace === 'Tokopedia'){
                                    profit = totalPenjualan - totalModal - Math.round(fee) - additionCost - powerMerchant
                                } else {
                                    profit = totalPenjualan - totalModal - Math.round(fee) - additionCost
                                }
                                setTotalProfit(profit)
                                
                            } else {
                                setPercentageKurir('0.0')
                                setFeeKurir(0)
                                setFeeKurirPreview(formatRupiah(0))

                                //total profit
                                var profit
                                if (marketplace === 'Tokopedia'){
                                    profit = totalPenjualan - totalModal - additionCost - powerMerchant
                                } else {
                                    profit = totalPenjualan - totalModal  - additionCost
                                }
                                setTotalProfit(profit)

                            }
                        }}
                    />
                    </View>

                        {/* percentage */}
                        <View style={styles.percentageContainer}>
                            <TextInput
                                value={percentageKurir}
                                keyboardType="decimal-pad"
                                placeholder= '0.0'
                                placeholderTextColor={Constant.GREY_PLACEHOLDER}
                                returnKeyType="done"
                                style={{height:'100%', minWidth:40, paddingLeft:10}}
                                onChangeText={handlePercentage}
                                onFocus={()=>{setPercentageKurir('')}}
                                onBlur={()=>{ if (percentageKurir == '') {setPercentageKurir('0.0')}}}
                            />

                            <Text style={[styles.boldText,{fontSize:16}]}>%</Text>
                        </View>

                        {/* amount */}
                        <TextInput
                            // editable={false}
                            value={feeKurirPreview}
                            keyboardType="number-pad"
                            placeholder= '0.0'
                            placeholderTextColor={Constant.GREY_PLACEHOLDER}
                            returnKeyType="done"
                            style={[styles.textInput,{marginTop:0, flex:1}]}
                        />  
                        
                    </View> 
                </View>

                {/* Biaya Tambahan */}
                <View style={[styles.section]}>
                    <Text>Biaya Tambahan (opsional)</Text>
                    
                    <View style={{flexDirection:'row'}}>         
                        <TextInput
                            value={additionDesc}
                            clearButtonMode='while-editing'
                            placeholder= 'Deskripsi'
                            placeholderTextColor={Constant.GREY_PLACEHOLDER}
                            returnKeyType="done"
                            autoCapitalize="none"
                            style={[styles.textInput, {flex:1}]}
                            onChangeText={setAdditionDesc}
                        />

                        <TextInput
                            value = {additionCostPreview}
                            keyboardType="number-pad"
                            placeholder= 'Rp 0'
                            placeholderTextColor={Constant.GREY_PLACEHOLDER}
                            returnKeyType="done"
                            style={[styles.textInput, {width: '35%', marginLeft:15}]}
                            onChangeText={(val)=>{handleMoneyInput(val, 'additional')}}
                            onBlur={()=>{if(additionCost == 0) setAdditionCostPreview(formatRupiah(0))}}

                        />
                    </View>
                </View>

                {/* Catatan */}
                <View style={[styles.section]}>
                    <Text>Catatan (opsional)</Text>
            
                    <TextInput
                        value={catatan}
                        multiline
                        clearButtonMode='while-editing'
                        placeholder= 'Catatan'
                        placeholderTextColor={Constant.GREY_PLACEHOLDER}
                        autoCapitalize="none"
                        style={[styles.textInput, {paddingTop:Platform.OS==='ios'? 12 : 7}]}
                        onChangeText={setCatatan}
                    />
                </View>

                
                
                {/* Total Profit */}
                <View style={{paddingVertical:15, marginTop:20, borderTopColor:"#f0f0f0", borderTopWidth:1}}>
                    
                    {/* PM PRO (tokopedia only) */}
                    {marketplace === 'Tokopedia' &&
                    <View style={styles.itemPrice}>
                        <Text>Biaya Power Merchant Pro (1.5%)</Text>
                        <Text>- {formatRupiah(powerMerchant)}</Text>
                    </View>
                    }
                    
                    {userRole != 'Admin' &&
                    <View style={styles.itemPrice}>
                        <Text style={{fontSize:16, color:'black', fontWeight:'bold'}}>Total Profit</Text>
                        <Text style={{fontSize:16, color:Constant.PRIMARY_COLOR, fontWeight:'bold'}}>{formatRupiah(totalProfit)}</Text>
                    </View>
                    }
                </View>

                {/* Add button */}
                <View style={{alignItems:'center', zIndex:-1}}>
                    <MainButton title='Simpan'  onPress={handleSaveTrans}/>
                </View>

                {/* padding bottom */}
                <View style={{height: Platform.OS === 'ios' ? 34 : 0}}/>

            </ScrollView>
            :
            <EmptyState/>
            }

            {/* ======= Date Picker ======== */}

            <DateTimePickerModal
                isDarkModeEnabled = {colorScheme == "dark" ? true : false}
                date = {date}
                display={Platform.OS === 'ios' ? "inline" : "calendar"}
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={()=>{setDatePickerVisibility(false)}}
            />

            {/* ========== MODAL =========== */}
            <Modal
            style={styles.modal}
            isVisible={isModalVisible}
            onBackdropPress={closeModal}
            onBackButtonPress={closeModal}
            >   
            <KeyboardAvoidingView behavior= {Platform.OS === 'ios'? 'position': null}>
                <View style={[styles.bottomModal,{height: open ? Constant.DEVICE_HEIGHT*0.6 : null}]}>
                    {/* header */}
                    <View style={styles.header}>
                        <Text style={styles.headerText}>{onItemClicked?"Edit Item" : "Tambah Item"}</Text>

                        {/* close modal icon */}
                        <TouchableOpacity style={styles.backButton} onPress={closeModal}>
                            <Icon
                                name='x'
                                type='feather'
                                color="black"
                                size={30}
                            />
                        </TouchableOpacity>

                        {/* remove item icon */}
                        {onItemClicked&&
                        <TouchableOpacity style={styles.removeButton} onPress={handleRemoveItem}>
                            <Icon
                                name='trash'
                                type='ionicon'
                                color="#FF5959"
                                size={25}
                            />
                        </TouchableOpacity>
                        }
                    </View>

                    {/* nama item */}
                    <View style={styles.section}>
                        <Text>Nama Produk</Text>

                        <DropDownPicker
                            dropDownDirection="BOTTOM"
                            maxHeight={Constant.DEVICE_HEIGHT*0.4}
                            searchable={true}
                            searchPlaceholder="Cari..."
                            searchContainerStyle={styles.searchContainerStyle}
                            searchTextInputStyle={styles.searchTextInputStyle}
                            ArrowUpIconComponent={() => <Icon name='arrow-drop-up' type='material' color="black" size={30}/>}
                            ArrowDownIconComponent={() => <Icon name='arrow-drop-down' type='material' color="black" size={30}/>}
                            placeholder="Pilih Produk"
                            placeholderStyle={{color: Constant.GREY_PLACEHOLDER}}
                            style={styles.dropdownStyle}
                            dropDownContainerStyle={styles.dropDownContainerStyle}
                            open={open}
                            value={value}
                            items={items}
                            setOpen={setOpen}
                            setValue={setValue}
                            setItems={setItems}
                            onChangeValue={handlePickItem}
                        />
                    </View>

                    <View style={styles.hargaContainer}>
                       
                        {/* Harga Modal*/}
                        {userRole != 'Admin' &&
                        <View style={[styles.section, {width:'47%'}]}>
                            <Text>Harga Modal</Text>
                    
                            <TextInput
                                value = {modalPreview}
                                clearButtonMode='while-editing'
                                keyboardType="number-pad"
                                placeholder= 'Rp 0'
                                placeholderTextColor={Constant.GREY_PLACEHOLDER}
                                returnKeyType="done"
                                autoCapitalize="words"
                                style={styles.textInput}
                                onChangeText={(val)=>handleMoneyInput(val,'modal')}
                                onBlur={()=>{if(modal == 0) setModalPreview(formatRupiah(0))}}
                            />
                        </View>
                        }

                        {/* Harga Jual*/}
                        <View style={[styles.section, {width:'47%'}]}>
                            <Text>Harga Jual</Text>
                    
                            <TextInput
                                value = {jualPreview}
                                clearButtonMode='while-editing'
                                keyboardType="number-pad"
                                placeholder= 'Rp 0'
                                placeholderTextColor={Constant.GREY_PLACEHOLDER}
                                returnKeyType="done"
                                autoCapitalize="words"
                                style={styles.textInput}
                                onChangeText={(val)=>handleMoneyInput(val,'jual')}
                                onBlur={()=>{if(jual == 0) setJualPreview(formatRupiah(0))}}
                            />
                        </View>
                    </View>

                    {/* Jumlah */}
                    <View style={[styles.section,{zIndex:-1}]}>
                        <Text>Jumlah</Text>
                        <View style={styles.quantity}>

                            {/* minus item */}
                            <TouchableOpacity style={styles.addIconContainer} onPress={()=>{if((Number(quantity)>1)) setQuantity((Number(quantity)-1).toString())}}>
                                <View style={styles.addIcon}>
                                    <Icon
                                        name='minus'
                                        type='material-community'
                                        color="white"
                                        size={15}
                                    />
                                </View>    
                            </TouchableOpacity>

                            {/* amount */}
                            <TextInput
                                value = {quantity}
                                // clearButtonMode='while-editing'
                                keyboardType="number-pad"
                                placeholder= '0'
                                placeholderTextColor={Constant.GREY_PLACEHOLDER}
                                returnKeyType="done"
                                autoCapitalize="words"
                                style={styles.qtyInput}
                                onChangeText={handleQty}
                                onFocus={()=>{setQuantity('')}}
                                onBlur={()=>{ if (quantity == '') {setQuantity('1')}}}
                            />

                            {/* add item */}
                            <TouchableOpacity style={styles.addIconContainer} onPress={()=>{setQuantity((Number(quantity)+1).toString())}}>
                                <View style={styles.addIcon}>
                                    <Icon
                                        name='plus'
                                        type='material-community'
                                        color="white"
                                        size={15}
                                    />
                                </View>    
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* "Tambah" Button */}
                    <View style={{alignItems:'center', zIndex:-1}}>
                        {onItemClicked?
                            <MainButton title='Simpan'  onPress={handleEditItem}/>
                        :
                            <MainButton title='Tambah'  onPress={handleAdd}/>
                        }
                    </View>

                </View>
                </KeyboardAvoidingView>
            </Modal>
            </KeyboardAvoidingView>
        </View>

         {/* loading indicator */}
         { loading &&
            <View style={styles.loading}>
                <View style={{backgroundColor:'white', borderRadius:10, padding:20}}>
                    <ActivityIndicator size="small" color={Constant.PRIMARY_COLOR}/>
                </View>
            </View>
            }

            {/* delete modal */}
            {deleteModal &&
            <View style={{position:'absolute',elevation:2, backgroundColor:'rgba(52, 52, 52, 0.8)', height:'100%', width:'100%',justifyContent:'center', alignItems:'center'}}>
                <View style={{backgroundColor:'white',  paddingVertical:10, borderRadius:15}}>
                    <Text style={{paddingTop:20, paddingBottom:10, paddingHorizontal:16,fontWeight:'bold', fontSize:16}}>Yakin ingin delete transaksi ini?</Text>
                    
                    <TouchableOpacity onPress={removeTransaction} style={{ justifyContent:'center', paddingVertical:12, marginTop:20, borderTopColor:'#f0f0f0', borderTopWidth:1}}>
                        <Text style={{textAlign:'center', color: '#FF8383'}}>Delete</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=>{setDeleteModal(false)}} style={{ justifyContent:'center', paddingVertical:12, borderTopColor:'#f0f0f0', borderTopWidth:1}}>
                        <Text style={{textAlign:'center'}}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
            }
        </>
    );
}

const styles = StyleSheet.create({
    screen :{
        flex:1,
        backgroundColor:'white',
        paddingTop : Constant.STATUSBAR,
    },
    mainScreen :{
        flex:1,
        paddingHorizontal: 16,
    },
    header:{
        flexDirection:'row',
        alignItems:'center',
        height: 44,
        justifyContent:"space-between"
    },
    headerText: {
        position: 'absolute', 
        textAlign:'center', 
        width:'100%'
    },
    backButton:{
        height:'100%', 
        justifyContent:'center', 
        paddingRight: 16
    },
    removeButton:{
        height:'100%', 
        justifyContent:'center', 
        paddingLeft: 16
    },
    section:{
        paddingVertical: 8,
    },
    boldText:{
        fontWeight:'bold'
    },
    collapse:{
        backgroundColor: Constant.GREY_BACKGROUND,
        flexDirection : 'row',
        paddingHorizontal: 16,
        borderRadius: 10,
        justifyContent:'space-between',
        alignItems:'center',
        marginTop:5,
        paddingVertical: Platform.OS === 'ios'? 10 : 10,

    },
    textInput:{
        backgroundColor: Constant.GREY_BACKGROUND,
        borderRadius: 10,
        paddingVertical: Platform.OS === 'ios'? 12 : 7,
        borderRadius: 10,
        paddingHorizontal: 16,
        marginTop:5,
    },
    smallGreyText:{
        fontSize: Constant.TERTIARY_FONT_SIZE,
        color : Constant.TERTIARY_GREY_COLOR
    },
    itemPrice:{
        flexDirection:'row',
        justifyContent:'space-between'
    },
    smallText:{
        fontSize : Constant.TERTIARY_FONT_SIZE
    },
    itemContainer:{
        paddingVertical:8,
        borderBottomWidth:1,
        borderBottomColor: '#f0f0f0',
    },
    addIconContainer: {
        alignItems:'flex-start', 
        paddingVertical:10
    },
    addIcon : {
        backgroundColor: Constant.PRIMARY_COLOR, 
        padding:5, 
        borderRadius:50 
    },
    modal:{
        margin:0, 
        flex:1, 
        justifyContent:'flex-end'
    },
    bottomModal:{
        backgroundColor:'white',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingTop:10,
        paddingHorizontal:16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 0
    },
    dropdownStyle: {
        backgroundColor: Constant.GREY_BACKGROUND,
        borderRadius:10,
        borderColor: "white",
        marginTop:5,
        height:45
    },
    dropDownContainerStyle: {
        borderColor: Constant.GREY_BACKGROUND,
        backgroundColor:'white',
        marginTop:5
    },
    searchTextInputStyle: {
        color: "#000",
        borderColor: "#dfdfdf",
        paddingVertical: Platform.OS === 'ios' ? 12 : 5
    },
    searchContainerStyle: {
        borderBottomColor: "white"
    },
    hargaContainer:{
        flexDirection:'row',
        justifyContent:'space-between',
        zIndex:-1
    },
    quantity:{
        flexDirection:'row',
        alignItems:'center',
    },
    qtyInput:{
        backgroundColor: Constant.GREY_BACKGROUND,
        paddingVertical: Platform.OS === 'ios'? 15 : 7,
        paddingHorizontal: 20,
        justifyContent:'center',
        alignItems:'center',
        marginHorizontal: 20,
        borderRadius:10,
        marginVertical:5
    },
    kurirBottom:{
        flexDirection:'row',
        marginTop:5,
        // alignItems:'center'
    },
    percentageContainer:{
        backgroundColor: Constant.GREY_BACKGROUND,
        borderRadius:10,
        flexDirection: 'row',
        marginHorizontal:15,
        justifyContent:'center',
        alignItems:'center',
        paddingRight:10,
    },
    loading: {
        backgroundColor:'rgba(52, 52, 52, 0.8)', 
        position: 'absolute', 
        width:'100%', 
        height:'100%', 
        justifyContent:'center', 
        alignItems:'center'
    },
    emptyScreen:{
        flex:1,
        paddingHorizontal:16
    }
    
});

export default ManageTransaction;
import React, { useEffect , useRef, useState} from 'react';
import {Animated, View, Text, useColorScheme, StyleSheet,Platform, Image, Alert,TouchableOpacity, KeyboardAvoidingView, ActivityIndicator, TextInput } from 'react-native';

//components
import Constant from '../../components/Constants'
import Header from '../../components/Header'
import ListExpense from '../../components/ListExpense'
import MainButton from '../../components/MainButton'

//import library
import { Icon } from 'react-native-elements';
import Modal from 'react-native-modal';
import DateTimePickerModal from "react-native-modal-datetime-picker";

const Expense = props=>{
     // when search is ready
    const [searchReady, setSearchReady] = useState(false)

    //search data
    const [searchList, setSearchList] = useState([])
    const [searchFocus, setSearchFocus] = useState(false)
    const [searchKeyword, setSearchKeyword] = useState('');

    //color scheme
    const colorScheme = useColorScheme();

    // loading state 
    const [ready, setReady] = useState(false);

    // Animation Variables
    const animate = useRef(new Animated.Value(0)).current;

    //today date
    var today = (require('moment')().format('DD MMM YYYY'))

    //activity indicator
    const [loading, setLoading] = useState(false)

    //delte modal
    const [deleteModal, setDeleteModal] = useState(false)

    //on editmode
    const [editMode, setEditMode] = useState(false)

    //datalist
    const [data, setData] = useState([])

    //data per item
    const [isModalVisible, setModalVisible]= useState(false)
    const [date, setDate] = useState(new Date())
    const [dateString, setDateString] = useState(today)
    const [id, setId] = useState (0)
    const [amount, setAmount] = useState(0)
    const [amountPreview, setAmountPreview] = useState('')
    const [description, setDescription] = useState('')

    //date picker
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false)

    // retrieve data first time
    useEffect(()=>{
        fetchData()
    },[]);

    // update data 
    const [updateData, setUpdateData] = useState(false)
    useEffect(()=>{
        if (updateData){
            fetchData()
            searchData(searchKeyword)
            setUpdateData(false)
        }
    },[updateData]);

    // to fetch expense data
     const fetchData = async ()=>{
        setReady(false)

        Animated.timing(animate, {
            toValue: Constant.DEVICE_WIDTH ,
            duration: 1000,
            useNativeDriver: false
        }).start()

        const URL = Constant.BASE_URL+"/expense_get";

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
                    console.log('no expense found')
                    setData([])
                    setReady(true)
                    animate.setValue(0)
                } else {
                    var data = responseData.data  
                    var listItem =[]

                    data.map((item)=>{
                        var temp = new Date(item.date)
                        var date = (require('moment')(temp).format('DD MMM YYYY'));
                        var object = {
                            id: item.id,
                            description : item.description,
                            amount : item.amount,
                            date : date,
                            created_at : item.date
                        }
                        listItem = [...listItem, object]
                    })

                    setData(listItem)
                    setReady(true)
                    animate.setValue(0)
                }
            }
        }catch(error){
            Alert.alert('Tidak ada Koneksi Internet');
        }
    }

    // Datetimepicker functions
    const showDatePicker = () => {
        if (Platform.OS == 'ios'){
            setModalVisible(false)
            setTimeout(()=>{setDatePickerVisibility(true)}, 400);
        } else {
            setDatePickerVisibility(true);
        }
    };
    
    const hideDatePicker = () => {
        if (Platform.OS == 'ios'){
            setDatePickerVisibility(false)
            setTimeout(()=>{setModalVisible(true)}, 400);
        } else {
            setDatePickerVisibility(false);
        }
    };
    const handleConfirm = (date) => {
        var dateStr = (require('moment')(date).format('DD MMM YYYY'))
        setDatePickerVisibility(false)
        setDate(date)
        setDateString(dateStr)

        if (Platform.OS == 'ios'){
            setTimeout(()=>{setModalVisible(true)}, 400);
        } 
    };

    //when Open Modal
    const openModal = () =>{
        setDate(new Date)
        setDateString(today)
        setModalVisible(true)
    }

    //when closing modal
    const closeModal = () =>{
        setModalVisible(false)
        setAmountPreview('')
        setAmount(0)
        setDescription('')
        setId(0)
        setEditMode(false)
    }

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

    // to handle of money input
    const handleMoneyInput = (val)=>{
        var amount = val.replace(/[^0-9]/g, '')
        
        setAmountPreview(formatRupiah(amount))
        setAmount(amount ? amount : 0)        
    }

    //when user click add
    const handleAdd = ()=>{
        if (description == ""){
            Alert.alert("Masukkan deskripsi pengeluaran")
        } else if (amount == 0){
            Alert.alert("Masukkan biaya pengeluaran")
        } else {

            var created_at = require('moment')(date).format('YYYY-MM-DD');

            var object = {
                id : id,
                description : description,
                date : created_at,
                amount : amount
            }
            if (editMode){
                setModalVisible(false)
                editExpense(object)
            } else {
                setModalVisible(false)
                addExpense(object)
            }
        }   
    }


    // to store expense
    const addExpense = async (object) =>{
        setLoading(true)
        const URL = Constant.BASE_URL+"/expense_add";

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

                    console.log('add expense success')

                    setLoading(false)
                    setData([...data])
                    closeModal()
                    setUpdateData(true)
                }
            }
        }catch(error){
            setLoading(false)
            console.log(error)
            Alert.alert('Tidak ada Koneksi Internet');
        }
    }

    // to edit expense
    const editExpense = async (object) => {
        setLoading(true)
        const URL = Constant.BASE_URL+"/expense_edit";

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

                    console.log('edit expense success')

                    setLoading(false)
                    setData([...data])
                    closeModal()
                    setUpdateData(true)
                }
            }
        }catch(error){
            setLoading(false)
            console.log(error)
            Alert.alert('Tidak ada Koneksi Internet');
        }
    }

    //when user press on item
    const onPressItem = (item)=>{
        setAmountPreview(formatRupiah(item.amount))
        setId(item.id)
        setAmount(item.amount)
        setDescription(item.description)
        setDate(new Date (item.created_at))
        setDateString(item.date)
        setEditMode(true)
        setModalVisible(true)
    }   

    //when user remove item
    const handleRemoveItem = async () =>{
        setDeleteModal(false)
        setLoading(true)
        const URL = Constant.BASE_URL+"/expense_remove";

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

                    console.log('remove expense success')

                    setLoading(false)
                    setData([...data])
                    closeModal()
                    setUpdateData(true)
                }
            }
        }catch(error){
            setLoading(false)
            console.log(error)
            Alert.alert('Tidak ada Koneksi Internet');
        }
    }

    // when app is still loading
    const SplashScreen = () =>{
        return (
            <View style={styles.splash}>
                <View style={styles.splashBar}/>
                <View style={styles.splashBar}/>
                <View style={styles.splashBar}/>
                <View style={styles.splashBar}/>

                <Animated.View style={{height:'100%', width: animate, backgroundColor:'white', position:'absolute',opacity:0.4}}/>
            </View>
        )
    }

    //empty state
    const EmptyState = ()=>{
        return (
            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <Image
                    style={{width: Constant.DEVICE_WIDTH*0.6,height:Constant.DEVICE_WIDTH*0.35}} 
                    source={require("../../../assets/empty_transaction.png")}
                    resizeMode='contain'
                />
                <Text style={{fontWeight:'bold', marginTop:10}}>Tidak Ada Pengeluaran</Text>
            </View>
        )
    }


    //handle search
    const onFocus = ()=>{
        setSearchFocus(true)
    }

    const onBlur = ()=>{
        setSearchFocus(false)
    }

    const onSearch = (val)=>{
        if(val != ''){
            searchData(val)
        }
        setSearchKeyword(val)
    }

    // to search data
     const searchData = async (val)=>{

        setSearchReady(false)

        const URL = Constant.BASE_URL+"/expense_search";

        try{
            const response = await fetch(URL, {
                method: "POST",
                body: JSON.stringify({
                    keyword: val
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
                    console.log('no expense found')
                    setSearchList([])
                    setSearchReady(true)
                } else {
                    console.log('expense found')
                    var data = responseData.data 
                    var listItem =[]

                    data.map((item)=>{
                        var temp = new Date(item.date)
                        var date = (require('moment')(temp).format('DD MMM YYYY'));
                        var object = {
                            id: item.id,
                            description : item.description,
                            amount : item.amount,
                            date : date,
                            created_at : item.date
                        }
                        listItem = [...listItem, object]
                    })

                    setSearchList(listItem)
                    setSearchReady(true)
                }
            }
        }catch(error){
            Alert.alert('Tidak ada Koneksi Internet');
        }
    }

    const onDelete = (item_id)=>{
        setId(item_id)
        setDeleteModal(true)
    }

    return(
        <View style={styles.screen}>
            <View style={styles.mainArea}>
                <Header onAdd={openModal} disabled={searchFocus} onFocus={onFocus} onBlur={onBlur} onSearch={onSearch}/>
                {!searchFocus?
                    <View style={{flex:1}}>
                    {ready?
                        <View style={styles.contentArea}>
                            {data.length != 0?
                            <ListExpense data ={data} onPressItem={onPressItem} onDelete={onDelete}/>
                            :
                            <EmptyState/>
                            }
                        </View>
                    :
                    <SplashScreen/>
                    }
                    </View>
                    :
                    <View style={{flex:1}}>
                    {searchReady?
                        <View style={styles.contentArea}>
                            {searchList.length != 0?
                            <ListExpense data ={searchList} onPressItem={onPressItem} onDelete={onDelete}/>
                            :
                            <EmptyState/>
                            }
                        </View>
                    :
                    <SplashScreen/>
                    }
                    </View>
                    }
            </View>
            
            {/* ===== Modal ===== */}
            <Modal
            style={styles.modal}
            isVisible={isModalVisible}
            onBackdropPress={closeModal}
            onBackButtonPress={closeModal}
            >   
            <KeyboardAvoidingView behavior= {Platform.OS === 'ios'? 'position': null}>
                <View style={styles.bottomModal}>
                    {/* header */}
                    <View style={styles.header}>
                        <Text style={styles.headerText}>{editMode?"Edit Pengeluaran" : "Tambah Pengeluaran"}</Text>

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
                        {editMode&&
                        <TouchableOpacity style={styles.removeButton} onPress={()=>{setModalVisible(false); setDeleteModal(true)}}>
                            <Icon
                                name='trash'
                                type='ionicon'
                                color="#FF8383"
                                size={25}
                            />
                        </TouchableOpacity>
                        }
                    </View>

                    

                    {/* Descripsi */}
                    <View style={styles.section}>
                        <Text>Deskripsi</Text>
                
                        <TextInput
                            multiline
                            value ={description}
                            clearButtonMode='while-editing'
                            placeholder= '(Beli Slasiban)'
                            placeholderTextColor={Constant.GREY_PLACEHOLDER}
                            returnKeyType="done"
                            autoCapitalize="sentences"
                            style={[styles.textInput, {paddingTop:Platform.OS === 'ios'? 12 : 7,maxHeight:120}]}
                            onChangeText={setDescription}
                        />
                    </View>

                    <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                        {/* date */}
                        <View style={[styles.section, {width:'47%'}]}>
                            <Text>Tanggal</Text>
                            <TouchableOpacity style={styles.collapse} onPress={showDatePicker}>
                                <Text>{dateString}</Text>
                                <Icon
                                    name='calendar'
                                    type='feather'
                                    color= {Constant.PRIMARY_COLOR}
                                    size={22}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* amount*/}
                        <View style={[styles.section, {width:'47%'}]}>
                            <Text>Biaya</Text>
                    
                            <TextInput
                                value = {amountPreview}
                                clearButtonMode='while-editing'
                                keyboardType="number-pad"
                                placeholder= 'Rp 0'
                                placeholderTextColor={Constant.GREY_PLACEHOLDER}
                                returnKeyType="done"
                                autoCapitalize="words"
                                style={styles.textInput}
                                onChangeText={(val)=>handleMoneyInput(val)}
                                onBlur={()=>{if(amount == 0) setAmountPreview(formatRupiah(0))}}
                            />
                        </View>
                    </View>

                    {/* "Tambah" Button */}
                    <View style={{alignItems:'center', paddingTop: 20}}>
                        <MainButton title={editMode?'Simpan':'Tambah'}  onPress={handleAdd}/>
                    </View>

                </View>
            </KeyboardAvoidingView>
            </Modal>

            {/* ======= Date Picker ======== */}

            <DateTimePickerModal
                isDarkModeEnabled = {colorScheme == "dark" ? true : false}
                date = {date}
                display={Platform.OS === 'ios' ? "inline" : "calendar"}
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
            />

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
                    <Text style={{paddingTop:20, paddingBottom:10, paddingHorizontal:16,fontWeight:'bold', fontSize:16}}>Yakin ingin delete item ini?</Text>
                    
                    <TouchableOpacity onPress={()=>{handleRemoveItem()}} style={{ justifyContent:'center', paddingVertical:12, marginTop:20, borderTopColor:'#f0f0f0', borderTopWidth:1}}>
                        <Text style={{textAlign:'center', color: '#FF8383'}}>Delete</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=>{setDeleteModal(false)}} style={{ justifyContent:'center', paddingVertical:12, borderTopColor:'#f0f0f0', borderTopWidth:1}}>
                        <Text style={{textAlign:'center'}}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    screen :{
        flex:1,
        backgroundColor:'white'
    },
    mainArea:{
        flex:1, 
        paddingTop: Constant.STATUSBAR
    },
    contentArea:{
        borderTopWidth:1,
        borderTopColor: '#f0f0f0',
        flex:1,
        // paddingHorizontal:16
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
    collapse:{
        backgroundColor: Constant.GREY_BACKGROUND,
        flexDirection : 'row',
        paddingHorizontal: 16,
        borderRadius: 10,
        justifyContent:'space-between',
        alignItems:'center',
        marginTop:5,
        paddingVertical: Platform.OS === 'ios'? 9 : 9.5,
    },
    textInput:{
        backgroundColor: Constant.GREY_BACKGROUND,
        borderRadius: 10,
        paddingVertical: Platform.OS === 'ios'? 12 : 7,
        borderRadius: 10,
        paddingHorizontal: 16,
        marginTop:5,
    },
    loading: {
        backgroundColor:'rgba(52, 52, 52, 0.8)', 
        position: 'absolute', 
        width:'100%', 
        height:'100%', 
        justifyContent:'center', 
        alignItems:'center'
    },
    splash:{
        paddingHorizontal:16,
        flex:1
    },
    splashBar:{
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginTop:10,
        height: 60
    }
});

export default Expense;
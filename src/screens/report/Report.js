import React, { useEffect , useRef, useState} from 'react';
import {Animated, View, Text, StyleSheet, RefreshControl, Image, Alert, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';

// components
import Constant from '../../components/Constants'

//import library
import { Icon } from 'react-native-elements';
import DropDownPicker from 'react-native-dropdown-picker';
import Modal from 'react-native-modal';

const Report = props=>{
    //color scheme
    const colorScheme = useColorScheme();
    
    // loading state 
    const [loading, setLoading] = useState(true);

    // refresh page
    const [refreshing, setRefreshing] = useState(false);

    // Animation Variables
    const animate = useRef(new Animated.Value(0)).current;

    //this month
    var thisMonth = (require('moment')().format('MMMM'))

    //this year
    var thisYear = (require('moment')().format('YYYY'))
    
    //modal visible
    const [isModalVisible, setModalVisible]= useState(false)
    const [modalMarketplace, setModalMarketPlace] = useState(0)

    //data
    const [month, setMonth] = useState(thisMonth)
    const [year, setYear] = useState(thisYear)

    // month dropdown //
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
        {label : 'January', value :'January'},
        {label : 'February', value :'February'},
        {label : 'March', value :'March'},
        {label : 'April', value :'April'},
        {label : 'May', value :'May'},
        {label : 'June', value :'June'},
        {label : 'July', value :'July'},
        {label : 'August', value :'August'},
        {label : 'September', value :'September'},
        {label : 'October', value :'October'},
        {label : 'November', value :'November'},
        {label : 'December', value :'December'}
    ]);

    // year dropdown //
    const [openY, setOpenY] = useState(false);
    const [valueY, setValueY] = useState(null);
    const [itemsY, setItemsY] = useState([]);

    //set Year menu
    useEffect(() => {        
       var year = Number(thisYear)
       var yearList =[]

       for (var i = 0 ; i < 10 ; i++){
           var object = {
               label : (year-i).toString(),
               value : (year-i).toString()
           }

           yearList = [...yearList, object]
       }
       setItemsY(yearList)
    }, []);

    //date picker
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false)

    const handleOpen = () => {
        setValueY(year)
        setValue(month)
        setDatePickerVisibility(true)
    };

    const handleCancel = () => {
        setDatePickerVisibility(false)
    };

    const handleConfirm = () => {
        setMonth(value)
        setYear(valueY)
        setDatePickerVisibility(false)
    };

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

    // ALL THE DATA
    //paket
    const [totalPaket, setTotalPaket] = useState(0)
    const [paketList, setPaketList] = useState([0,0,0,0,0])

    //modal
    const [totalModal, setTotalModal] = useState(0)
    const [modalList, setModalList] = useState([0,0,0,0,0])

    //penjualan
    const [totalPenjualan, setTotalPenjualan] = useState(0)
    const [penjualanList, setPenjualanList] = useState([0,0,0,0,0])

    //profit
    const [totalProfit, setTotalProfit] = useState(0)
    const [profitList, setProfitList] = useState([0,0,0,0,0])

    //biaya operasi
    const [totalBiaya, setTotalBiaya] = useState(0)
    const [biayaList, setBiayaList] = useState([0,0,0,0,0])

    // biaya operasi detail
    const [pmList, setPmList] = useState([0,0,0,0,0])
    const [kurirList, setKurirList] = useState([0,0,0,0,0])
    const [tambahanList, setTambahanList] = useState([0,0,0,0,0])

    //pengeluaran
    const [totalPengeluaran, setTotalPengeluaran] = useState(0)

    //update data when date change
    useEffect(() => {  
         
        fetchData()
    }, [year,month]);


    //hanlde on refresh
    const wait = timeout => {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
        });
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData()
        wait(100).then(() => setRefreshing(false));
    };

    //to fetch all data 
    const fetchData = async () =>{
        setLoading(true)

        Animated.timing(animate, {
            toValue: Constant.DEVICE_WIDTH ,
            duration: 2500,
            useNativeDriver: false
        }).start()

        var monthYear = '01 '+month +' '+year
        var date = new Date(monthYear)
        var start_month = require('moment')(date).startOf('month').format('YYYY-MM-DD');
        var end_month = require('moment')(date).endOf('month').format('YYYY-MM-DD');
        await getPacket(start_month, end_month)
        await getReport(start_month, end_month)
        await getExpense(start_month, end_month)
        setLoading(false)
        animate.setValue(0)
    }
    

    // to fetch packet data
     const getPacket = async (start_month, end_month)=>{
        const URL = Constant.BASE_URL+"/packet_get";

        try{
            const response = await fetch(URL, {
                method: "POST",
                body: JSON.stringify({
                    start_month:start_month,
                    end_month : end_month
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
                    console.log('no packet found')
                    setPaketList([0,0,0,0,0])
                    setTotalPaket(0)

                } else {
                    console.log('found')
                    var data = responseData.data  
                    var listData =[0,0,0,0,0]
                    var totalAmount = 0
                    data.map((item)=>{
                        totalAmount+=item.count

                        switch (item.marketplace) {
                            case "Tokopedia":
                                listData[0] = item.count
                                break;

                            case "Whatsapp":
                                listData[1] = item.count
                                break;
                            
                            case "Shopee":
                                listData[2] = item.count
                                break;

                            case "Instagram":
                                listData[3] = item.count
                                break;

                            case "Lazada":
                                listData[4] = item.count
                                break;
                        
                            default:
                                break;
                        }
                    })
                    setPaketList([...listData])
                    setTotalPaket(totalAmount)
                }
            }
        }catch(error){
            Alert.alert('Tidak ada Koneksi Internet');
        }
    }


    // to fetch transaction data
     const getReport = async (start_month, end_month)=>{
        const URL = Constant.BASE_URL+"/report_get";

        try{
            const response = await fetch(URL, {
                method: "POST",
                body: JSON.stringify({
                    start_month:start_month,
                    end_month : end_month
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
                    
                    console.log('no transaction found')

                    //profit
                    setTotalProfit(0)
                    setProfitList([0,0,0,0,0])

                    //modal
                    setTotalModal(0)
                    setModalList([0,0,0,0,0])

                    //penjualan
                    setTotalPenjualan(0)
                    setPenjualanList([0,0,0,0,0])

                    //biaya
                    setTotalBiaya(0)
                    setBiayaList([0,0,0,0,0])

                    //biaya detail
                    setPmList([0,0,0,0,0])
                    setKurirList([0,0,0,0,0])
                    setTambahanList([0,0,0,0,0])

                } else {
                    console.log('transaction found')
                    var data = responseData.data  


                    var profitList =[0,0,0,0,0]
                    var modalList =[0,0,0,0,0]
                    var penjualanList =[0,0,0,0,0]

                    //additional cost
                    var powerMerchantList =[0,0,0,0,0]
                    var kurirList =[0,0,0,0,0]
                    var tambahanList =[0,0,0,0,0]

                    var biayaList =[0,0,0,0,0]
                    
                    data.map((item)=>{
                        switch (item.marketplace) {
                            case "Tokopedia":
                                profitList[0] += item.profit
                                modalList[0] += item.modal
                                penjualanList[0] += item.penjualan
                                powerMerchantList[0] += item.power_merchant
                                kurirList[0] += item.kurir
                                tambahanList[0] += item.tambahan
                                break;

                            case "Whatsapp":
                                profitList[1] += item.profit
                                modalList[1] += item.modal
                                penjualanList[1] += item.penjualan
                                kurirList[1] += item.kurir
                                tambahanList[1] += item.tambahan
                                break;
                            
                            case "Shopee":
                                profitList[2] += item.profit
                                modalList[2] += item.modal
                                penjualanList[2] += item.penjualan
                                kurirList[2] += item.kurir
                                tambahanList[2] += item.tambahan
                                break;

                            case "Instagram":
                                profitList[3] += item.profit
                                modalList[3] += item.modal
                                penjualanList[3] += item.penjualan
                                kurirList[3] += item.kurir
                                tambahanList[3] += item.tambahan
                                break;

                            case "Lazada":
                                profitList[4] += item.profit
                                modalList[4] += item.modal
                                penjualanList[4] += item.penjualan
                                kurirList[4] += item.kurir
                                tambahanList[4] += item.tambahan
                                break;
                        
                            default:
                                break;
                        }
                    })

                    let totProfit = 0;
                    let totModal = 0;
                    let totPenjualan = 0;
                    let totBiaya = 0;

                    for (let i = 0; i < 5; i++) {
                        totProfit += profitList[i];
                        totModal += modalList[i]
                        totPenjualan += penjualanList[i]
                        var biaya = powerMerchantList[i] + kurirList[i] + tambahanList[i]
                        biayaList[i] = biaya
                        totBiaya += biaya
                    }
                    //penjualan
                    setTotalPenjualan(totPenjualan)
                    setPenjualanList(penjualanList)

                    //modal
                    setTotalModal(totModal)
                    setModalList(modalList)

                    //biaya
                    setTotalBiaya(totBiaya)
                    setBiayaList(biayaList)

                    //biaya detail
                    setPmList(powerMerchantList)
                    setKurirList(kurirList)
                    setTambahanList(tambahanList)

                    //profit
                    setTotalProfit(totProfit)
                    setProfitList(profitList)
                    
                }
            }
        }catch(error){
            Alert.alert('Tidak ada Koneksi Internet');
        }
    }

    // to fetch expense data
     const getExpense = async (start_month, end_month)=>{
        const URL = Constant.BASE_URL+"/expense_get_monthly";

        try{
            const response = await fetch(URL, {
                method: "POST",
                body: JSON.stringify({
                    start_month: start_month,
                    end_month : end_month
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
                    setTotalPengeluaran(0)

                } else {
                    console.log('expense found')
                    var data = responseData.data  

                    var totalAmount = 0

                    data.map((item)=>{
                        totalAmount+=item.pengeluaran
                    })
                    setTotalPengeluaran(totalAmount)
                }
            }
        }catch(error){
            Alert.alert('Tidak ada Koneksi Internet');
        }
    }

    // render collapse item
    const CollapseItem = ({type}) =>{

        const [open, setOpen] = useState(false)
        var total = 0
        var listItem = []
        var textColor 
        var disabled = true

        switch (type) {
            case "Total Paket":
                total = totalPaket
                listItem = paketList
                textColor = Constant.PRIMARY_COLOR
                break;

            case "Total Modal":
                total = '- '+formatRupiah(totalModal)
                listItem = modalList
                textColor = "#FF8383"
                break;

            case "Total Penjualan":
                total = formatRupiah(totalPenjualan)
                listItem = penjualanList
                textColor = Constant.PRIMARY_COLOR
                break;
            
            case "Total Profit":
                total = formatRupiah(totalProfit)
                listItem = profitList
                textColor = Constant.PRIMARY_COLOR
                break;

            case "Biaya Operasi":
                total = '- '+formatRupiah(totalBiaya)
                listItem = biayaList
                textColor = "#FF8383"
                disabled = false
                break;
        
            default:
                break;
        }

        return (
            <View style={{}}>
                <TouchableOpacity style={styles.collapse}  onPress={()=>{setOpen(!open)}}>
                    <Text>{type}</Text>

                    <View style={{flexDirection:'row', alignItems:'center'}}>
                        <Text style={{color: textColor, paddingRight:5}}>{total}</Text>
                        <Icon name={open ? 'arrow-drop-up' : 'arrow-drop-down'} type='material' color="black" size={20}/>
                    </View>
                </TouchableOpacity>

                {open &&    
                <View style={styles.collapseOpened}>
                    {/* Tokopedia */}
                    <TouchableOpacity style={styles.marketplaceContainer} disabled={disabled} onPress={()=>{setModalMarketPlace(0); setModalVisible(true)}}>
                        <Image
                        style={styles.logo} 
                        source={require("../../../assets/tokopedia.png")}
                        resizeMode='cover'
                        />
                        <Text style={styles.logoText}>{type == 'Total Paket'? listItem[0] : formatRupiah(listItem[0])}</Text>
                    </TouchableOpacity>

                    {/* Whatsapp */}
                    <TouchableOpacity style={styles.marketplaceContainer} disabled={disabled} onPress={()=>{setModalMarketPlace(1); setModalVisible(true)}}>
                        <Image
                        style={styles.logo} 
                        source={require("../../../assets/whatsapp.png")}
                        resizeMode='cover'
                        />
                        <Text style={styles.logoText}>{type == 'Total Paket'? listItem[1] : formatRupiah(listItem[1])}</Text>
                    </TouchableOpacity>

                    {/* Shopee */}
                    <TouchableOpacity style={styles.marketplaceContainer} disabled={disabled} onPress={()=>{setModalMarketPlace(2); setModalVisible(true)}}>
                        <Image
                        style={styles.logo} 
                        source={require("../../../assets/shopee.png")}
                        resizeMode='cover'
                        />
                        <Text style={styles.logoText}>{type == 'Total Paket'? listItem[2] : formatRupiah(listItem[2])}</Text>
                    </TouchableOpacity>

                    {/* Instagram */}
                    <TouchableOpacity style={styles.marketplaceContainer} disabled={disabled} onPress={()=>{setModalMarketPlace(3); setModalVisible(true)}}>
                        <Image
                        style={styles.logo} 
                        source={require("../../../assets/instagram.png")}
                        resizeMode='cover'
                        />
                        <Text style={styles.logoText}>{type == 'Total Paket'? listItem[3] : formatRupiah(listItem[3])}</Text>
                    </TouchableOpacity>

                    {/* Lazada */}
                    <TouchableOpacity style={styles.marketplaceContainer} disabled={disabled} onPress={()=>{setModalMarketPlace(4); setModalVisible(true)}}>
                        <Image
                        style={styles.logo} 
                        source={require("../../../assets/lazada.png")}
                        resizeMode='cover'
                        />
                        <Text style={styles.logoText}>{type == 'Total Paket'? listItem[4] : formatRupiah(listItem[4])}</Text>
                    </TouchableOpacity>
                </View>
                }
            </View>
        )
    }

    const SplashScreen = () =>{
        return (
            <View style={styles.splash}>
                <View style={styles.splashBar}/>
                <View style={styles.splashText}/>
                <View style={styles.splashBar}/>
                <View style={styles.splashBar}/>
                <View style={styles.splashBar}/>
                <View style={styles.line}/>
                <View style={styles.splashBar}/>
                <View style={styles.splashBar}/>
                <View style={styles.line}/>
                <View style={{flexDirection:'row', flex:1, justifyContent:'space-between'}}>
                    <View style={styles.splashText}/>
                    <View style={styles.splashText}/>
                </View>
                <Animated.View style={{height:'100%', width: animate, backgroundColor:'white', position:'absolute',opacity:0.4}}/>
            </View>
        )
    }

    const ImageLogo = () =>{
        var type = modalMarketplace
        var uri
        switch (type) {
            case 0:
                uri = require("../../../assets/tokopedia.png")
                break;
            case 1:
                uri = require("../../../assets/whatsapp.png")
                break;
            case 2:
                uri = require("../../../assets/shopee.png")
                break;
            case 3:
                uri = require("../../../assets/instagram.png")
                break;
            case 4:
                uri = require("../../../assets/lazada.png")
                break;
        
            default:
                break;
        }
        return (
        <Image
            style={{width:80, height:80}} 
            source={uri}
            resizeMode='cover'
        />
        )
    }

    return(
        <View style={styles.screen}>
            
            <View style={styles.mainArea}> 
                <View style={styles.header}> 
                    <TouchableOpacity onPress={handleOpen} style={styles.headerDate}>
                        <Text style={{paddingHorizontal:10}}>{month+' '+year }</Text>

                        <Icon
                            name='calendar'
                            type='feather'
                            color= {Constant.PRIMARY_COLOR}
                            size={20}
                        />
                    </TouchableOpacity>
                </View>
                {!loading?
                <ScrollView 
                style={{paddingHorizontal:16}}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    <CollapseItem type={"Total Paket"} />
                    <Text style={{paddingTop:20, fontWeight:'bold'}}>Laporan Keuangan</Text>
                    
                    <CollapseItem type={"Total Penjualan"} />
                    <CollapseItem type={"Total Modal"} />
                    <CollapseItem type={"Biaya Operasi"} />

                    <View style={styles.line}/>

                    <CollapseItem type={"Total Profit"} />
                    
                    <View style={styles.collapse}>
                        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', flex:1, paddingVertical:2}}>
                            <Text>Total Pengeluaran</Text>
                            <Text style={{color:'#FF8383' , paddingRight:10}}>- {formatRupiah(totalPengeluaran)}</Text>
                        </View>
                    </View>

                    <View style={styles.line}/>

                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', flex:1, paddingTop:2, paddingBottom:20}}>
                            <Text style={{fontWeight:'bold', fontSize:16}}> Total Pendapatan</Text>
                            <Text style={{color: Constant.PRIMARY_COLOR , paddingRight:10, fontWeight:"bold", fontSize:16}}>{formatRupiah(totalProfit - totalPengeluaran)}</Text>
                        </View>
            
                </ScrollView>
                :
                <SplashScreen/> 
                }
            </View>
            

            {/* ======= Date Picker ======== */}
            {isDatePickerVisible &&
            <View style={styles.dateScreen}>
                <View style={styles.dateModal}> 
                    <View style={[styles.dateContainer,{ height: open || openY ?250: null}]}>
                        <View style={{paddingRight:16}}>
                        <DropDownPicker
                            dropDownDirection="BOTTOM"
                            ArrowUpIconComponent={() => <Icon name='arrow-drop-up' type='material' color="black" size={30}/>}
                            ArrowDownIconComponent={() => <Icon name='arrow-drop-down' type='material' color="black" size={30}/>}
                            placeholder="Month"
                            placeholderStyle={{color: Constant.GREY_PLACEHOLDER}}
                            style={[styles.dropdownStyle, {marginTop:0, width:Constant.DEVICE_WIDTH*0.5}]}
                            dropDownContainerStyle={[styles.dropDownContainerStyle,{marginTop:0}]}
                            maxHeight={200}
                            open={open}
                            value={value}
                            items={items}
                            setOpen={setOpen}
                            setValue={setValue}
                            setItems={setItems}
                        />
                        </View>

                        <View>
                        <DropDownPicker
                            zIndex={7000}
                            dropDownDirection="BOTTOM"
                            ArrowUpIconComponent={() => <Icon name='arrow-drop-up' type='material' color="black" size={30}/>}
                            ArrowDownIconComponent={() => <Icon name='arrow-drop-down' type='material' color="black" size={30}/>}
                            placeholder="Year"
                            placeholderStyle={{color: Constant.GREY_PLACEHOLDER}}
                            style={[styles.dropdownStyle, {marginTop:0, width:Constant.DEVICE_WIDTH*0.3}]}
                            dropDownContainerStyle={[styles.dropDownContainerStyle,{marginTop:0}]}
                            maxHeight={200}
                            open={openY}
                            value={valueY}
                            items={itemsY}
                            setOpen={setOpenY}
                            setValue={setValueY}
                            setItems={setItemsY}
                        />
                        </View>
                    </View>

                    <View style={{borderTopWidth:1, borderTopColor:'#f0f0f0', flexDirection:'row', justifyContent:'flex-end', height: 40, marginTop:16}}>
                        
                        {/* cancel button */}
                        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>

                        {/* Confirm button */}
                        <TouchableOpacity onPress={handleConfirm} style={styles.cancelButton}>
                            <Text style={{color: Constant.PRIMARY_COLOR}}>Search</Text>
                        </TouchableOpacity>
                        
                    </View>
                </View>
            </View>
            }

            <Modal
            style={styles.modal}
            isVisible={isModalVisible}
            onBackdropPress={()=>{setModalVisible(false)}}
            onBackButtonPress={()=>{setModalVisible(false)}}
            >   
                <View style={{backgroundColor:'white', width:'80%', paddingHorizontal:16, paddingVertical:25, borderRadius:20}}>

                    <View style={{justifyContent:'center', alignItems:'center', paddingBottom:16}} >
                        <ImageLogo/>
                    </View>

                    <View style={{flexDirection:'row', justifyContent:'space-between', paddingTop:10}}>
                        <Text>Power Merchant</Text>
                        <Text>{formatRupiah(pmList[modalMarketplace])}</Text>
                    </View>

                    <View style={{flexDirection:'row', justifyContent:'space-between', paddingTop:5}}>
                        <Text>% Biaya Kurir</Text>
                        <Text>{formatRupiah(kurirList[modalMarketplace])}</Text>
                    </View>

                    <View style={{flexDirection:'row', justifyContent:'space-between', paddingTop:5}}>
                        <Text>Biaya Tambahan</Text>
                        <Text>{formatRupiah(tambahanList[modalMarketplace])}</Text>
                    </View>

                    <View style={styles.line}/>

                    <View style={{flexDirection:'row', justifyContent:'space-between', paddingTop:5}}>
                        <Text style={{fontWeight:'bold'}}>Total Biaya Operasi</Text>
                        <Text style={{fontWeight:'bold'}}>{formatRupiah(biayaList[modalMarketplace])}</Text>
                    </View>
                    
                </View>
            </Modal>
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
        width:'100%', 
        paddingTop: Constant.STATUSBAR
    },
    splash:{
        paddingHorizontal:16,
        flex:1
    },
    header:{
        justifyContent:'center',
        flexDirection:'row',
        alignItems:'center',
        height:50,
        borderBottomColor : '#f0f0f0',
        borderBottomWidth:1
    },
    collapse:{
        backgroundColor: Constant.GREY_BACKGROUND,
        flexDirection : 'row',
        paddingHorizontal: 16,
        borderRadius: 10,
        justifyContent:'space-between',
        alignItems:'center',
        marginTop:12,
        paddingVertical: 10,
    },
    logo:{
        height: Constant.DEVICE_WIDTH*0.12,
        width: Constant.DEVICE_WIDTH*0.12,
        margin: 10,
    },
    logoText:{
        color:'grey',
        fontSize:13
    },
    marketplaceContainer:{
        flexDirection:'row',
        width:'50%',
        alignItems:'center'
    },
    collapseOpened:{
        flexDirection:'row',
        flexWrap:'wrap'
    },
    headerDate: {
        flexDirection:'row',
        alignItems:'center', 
        justifyContent:'center', 
        height:'100%'
    },
    dateScreen:{
        position:'absolute',
        elevation:1, 
        backgroundColor:'rgba(52, 52, 52, 0.8)', 
        height:'100%', 
        width:'100%',
        justifyContent:'center', 
        alignItems:'center',
    },
    dateModal:{
        backgroundColor :'white',
        paddingVertical:20,
        paddingHorizontal:16,
        borderRadius:15
    },
    dropdownStyle: {
        backgroundColor: Constant.GREY_BACKGROUND,
        borderRadius:10,
        borderColor: "white",
        marginTop:5,
        height:45,
    },
    dropDownContainerStyle: {
        borderColor: Constant.GREY_BACKGROUND,
        backgroundColor:'white',
        marginTop:5,
    },
    dateContainer:{
        flexDirection:'row',
        justifyContent:'center',
        // alignItems:'center'
    },
    cancelButton : {
        justifyContent:'center', 
        paddingHorizontal:20
    },
    splashBar:{
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginTop:12,
        height: 45
    },
    splashText:{
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        marginTop:12,
        height: 20,
        width:100
    },
    line :{
        width:'100%', 
        borderBottomWidth:1, 
        borderBottomColor:'#f0f0f0', 
        height: 10,
        marginVertical:10 
    },
    modal:{
        margin:0, 
        flex:1, 
        justifyContent:'center',
        alignItems:'center'
    },
});

export default Report;
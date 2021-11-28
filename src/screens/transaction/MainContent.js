import React, { useEffect , useState, useRef} from 'react';
import {Animated, View, Text, StyleSheet, Image, Alert, ScrollView, FlatList, TouchableOpacity, useColorScheme} from 'react-native';

//import library
import { Icon } from 'react-native-elements';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';

// import components
import Constant from '../../components/Constants';
import Search from '../../components/Search';
import AddButton from '../../components/AddButton';
import ListTransaction from '../../components/ListTransaction';

const MainContent = ({marketplace, update, onPress, searchFocus, searchList, searchReady})=>{

    const [userRole, setUserRole] = useState('Admin')
    
    // set user role
    useEffect(() => {  
        LoadUsers()
    }, []);

    // loading user from local storage
    const LoadUsers = async ()=>{
        AsyncStorage.getItem("ROLE").then(value => {
            console.log(value)
            setUserRole(value)
        }).catch((error)=> console.log(error))
     }

    //color scheme
    const colorScheme = useColorScheme();

    // Animation Variables
    const animate = useRef(new Animated.Value(0)).current;

    // when page is ready
    const [ready, setready] = useState(false)

    //handle date
    var today = (require('moment')().format('DD MMMM YYYY'))
    const [date, setDate] = useState(new Date())
    const [dateString, setDateString] = useState(today)

    //date picker
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false)

    //on date confirm
    const handleConfirm = (date) => {
        var dateStr = (require('moment')(date).format('DD MMMM YYYY'))
        setDatePickerVisibility(false)
        setDate(date)
        setDateString(dateStr)
    };

    // data
    const [data, setData] = useState([])

    // update data on inserted transaksi
    useEffect(() => {
        if (update != null){
            setDate(update)
            var dateStr = (require('moment')(update).format('DD MMMM YYYY'))
            setDateString(dateStr)
            fetchData()
        }
    }, [update]);

    // update data 
    useEffect(()=>{
        fetchData()
    },[date]);


    // to fetch transaction data
     const fetchData = async ()=>{
        setready(false)

        Animated.timing(animate, {
            toValue: Constant.DEVICE_WIDTH ,
            duration: 2000,
            useNativeDriver: false
        }).start()

        var created_at = require('moment')(date).format('YYYY-MM-DD')
        const URL = Constant.BASE_URL+"/transaction_get";

        try{
            const response = await fetch(URL, {
                method: "POST",
                body: JSON.stringify({
                    marketplace : marketplace,
                    created_at : created_at
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
                    console.log('no data')
                    setData([])
                    setready(true)
                    animate.setValue(0)
                } else {
                    var data = responseData.data
                    var firstItem
                    var listItem =[]
                    data.map((item)=>{
                        var firstItem = JSON.parse(item.item)[0]
                        
                        var object = {
                            id: item.id,
                            no: item.no,
                            customer_name : item.customer_name,
                            item_name : firstItem.name,
                            quantity : firstItem.quantity,
                            total_profit : item.total_profit
                        }
                        listItem = [...listItem, object]
                    })
                    setData(listItem)
                    setready(true)
                    animate.setValue(0)
                }
            }
        }catch(error){
            Alert.alert('Tidak ada Koneksi Internet');
        }
    }

    //empty state
    const EmptyState = ()=>{
        return (
            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <Image
                    style={{width: '70%', height:'30%'}} 
                    source={require("../../../assets/empty.png")}
                    resizeMode='contain'
                />
                <Text style={{fontWeight:'bold', marginVertical:10}}>Tidak Ada Transaksi</Text>
            </View>
        )
    }

    //when user press transaction item
    const onPressItem = (item) =>{
        onPress(item)
    }

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

    return(
        <View style={styles.screen}>
                {!searchFocus?
                <View style={styles.section}>
                    {/* collapse button */}
                    <TouchableOpacity style={styles.collapse} onPress={()=>{setDatePickerVisibility(true)}}>
                        <Text>{dateString}</Text>
                        <Icon
                            name='calendar'
                            type='feather'
                            color= {Constant.PRIMARY_COLOR}
                            size={22}
                        />
                    </TouchableOpacity>

                    {/* the content of it */}
                    
                    {ready ?
                        <View style={{flex:1}}>
                            {data.length != 0 ?
                                <ListTransaction userRole={userRole} data={data} onPressItem = {onPressItem}/>
                            : 
                                <EmptyState/>
                            }
                        </View> 
                    :
                        <SplashScreen/>
                    }
                        
                </View>
                :
                    <View style={styles.section}>

                    {/* the content of it */}         
                    {searchReady ?
                        <View style={{flex:1}}>
                            {searchList.length != 0 ?
                                <ListTransaction userRole={userRole} data={searchList} onPressItem = {onPressItem}/>
                            : 
                                <EmptyState/>
                            }
                        </View> 
                    :
                        <SplashScreen/>
                    }
                        
                </View>
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
        </View>
    );
}

const styles = StyleSheet.create({
    screen :{
        flex:1,
        backgroundColor:'white',
        paddingHorizontal:16,
    },
    collapse:{
        backgroundColor: Constant.GREY_BACKGROUND,
        flexDirection : 'row',
        paddingHorizontal: 16,
        borderRadius: 10,
        justifyContent:'space-between',
        alignItems:'center',
        marginTop:12,
        paddingVertical: Platform.OS === 'ios'? 10 : 10,
    },
    section : {
        flex:1,
    },
    splash:{
        flex:1
    },
    splashBar:{
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginTop:10,
        height: 60
    }
});

export default MainContent;
import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text, Image, TouchableOpacity, Alert} from 'react-native';

// components
import Constant from '../../components/Constants';
import Search from '../../components/Search';
import AddButton from '../../components/AddButton';
import Modal from 'react-native-modal';

//import library
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

//import screens
import Tokopedia from './Tokopedia';
import Shopee from './Shopee';
import Whatsapp from './Whatsapp';
import Instagram from './Instagram';
import Lazada from './Lazada';

const Tab = createMaterialTopTabNavigator();

const Transaction = props=>{
    // when search is ready
    const [searchReady, setSearchReady] = useState(false)

    //modal
    const [isModalVisible, setModalVisible]= useState(false)

    //search data
    const [searchList, setSearchList] = useState([])
    const [searchFocus, setSearchFocus] = useState(false)
    const [marketplace, setMarketplace] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    //handle choose icon
    const handleTapIcon = (marketplace) =>{
        setModalVisible(false)
        props.navigation.navigate(
        {
            name: 'manageTransaction', 
            params: {marketplace: marketplace}
        })
    }

    const SearchFocus = ()=>{
        setSearchReady(false)
        setSearchFocus(true)
    }

    const SearchBlur = ()=>{
        setSearchFocus(false)
        setSearchList([])
    }


    const onChange = (val)=>{
        if(val != ''){
            fetchData(val)
        }
        setSearchKeyword(val)
    }

    const updateData = ()=>{
        fetchData(searchKeyword)
    }

    // update data on focus on tab
    useEffect(() => {   
        if (searchFocus){
            updateData()
        }     
    }, [marketplace]);

    // to fetch search data
     const fetchData = async (val)=>{
        setSearchReady(false)

        const URL = Constant.BASE_URL+"/search_get";

        try{
            const response = await fetch(URL, {
                method: "POST",
                body: JSON.stringify({
                    marketplace: marketplace,
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
                    setSearchList([])
                    setSearchReady(true)
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
                    setSearchList(listItem)
                    setSearchReady(true)
                }
            }
        }catch(error){
            Alert.alert('Tidak ada Koneksi Internet');
        }
    }


    return(
        <View style={styles.screen}>
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <Search
                        onFocus={SearchFocus} 
                        onBlur={SearchBlur} 
                        onSearch={onChange}
                    />

                        {!searchFocus &&
                            <AddButton onPress={()=>(setModalVisible(true))}/>
                        }
                </View>
            </View>

            {/* tabs */}
            <Tab.Navigator
            lazy ={true}
            tabBarOptions={{
                keyboardHidesTabBar: true,
                activeTintColor: Constant.PRIMARY_COLOR,
                inactiveTintColor: '#676767',
                indicatorStyle:{backgroundColor: Constant.PRIMARY_COLOR,},
                labelStyle: { textTransform: 'none', fontSize:10, margin:0},
            }}
            >
                <Tab.Screen name="Tokopedia" >
                        {(props) => (
                                <Tokopedia setMarketplace={setMarketplace} searchFocus={searchFocus} searchList={searchList} searchReady={searchReady} updateData={updateData}{...props}/>
                        )}
                </Tab.Screen>
                <Tab.Screen name="Shopee" >
                        {(props) => (
                                <Shopee setMarketplace={setMarketplace} searchFocus={searchFocus} searchList={searchList} searchReady={searchReady} updateData={updateData}{...props}/>
                        )}
                </Tab.Screen>
                <Tab.Screen name="Whatsapp" >
                        {(props) => (
                                <Whatsapp setMarketplace={setMarketplace} searchFocus={searchFocus} searchList={searchList} searchReady={searchReady} updateData={updateData}{...props}/>
                        )}
                </Tab.Screen>
                <Tab.Screen name="Instagram" >
                        {(props) => (
                                <Instagram setMarketplace={setMarketplace} searchFocus={searchFocus} searchList={searchList} searchReady={searchReady} updateData={updateData}{...props}/>
                        )}
                </Tab.Screen>
                <Tab.Screen name="Lazada" >
                        {(props) => (
                                <Lazada setMarketplace={setMarketplace} searchFocus={searchFocus} searchList={searchList} searchReady={searchReady} updateData={updateData}{...props}/>
                        )}
                </Tab.Screen>
            </Tab.Navigator>

            <Modal
            style={styles.modal}
            isVisible={isModalVisible}
            onBackdropPress={()=>{setModalVisible(false)}}
            onBackButtonPress={()=>{setModalVisible(false)}}
            >   
                <View style={styles.bottomModal}>
                    <View style={styles.logoContainer}>
                        <TouchableOpacity style={styles.logoHolder} onPress={()=>(handleTapIcon('Tokopedia'))}>
                            <Image
                            style={styles.logo} 
                            source={require("../../../assets/tokopedia.png")}
                            resizeMode='cover'
                            />

                            <Text style={styles.logoText}>Tokopedia</Text>
                        </TouchableOpacity>  

                        <TouchableOpacity style={styles.logoHolder} onPress={()=>(handleTapIcon('Shopee'))}>
                            <Image
                            style={styles.logo} 
                            source={require("../../../assets/shopee.png")}
                            resizeMode='cover'
                            />

                            <Text style={styles.logoText}>Shopee</Text>
                        </TouchableOpacity>  

                        <TouchableOpacity style={styles.logoHolder} onPress={()=>(handleTapIcon('Whatsapp'))}>
                            <Image
                            style={styles.logo} 
                            source={require("../../../assets/whatsapp.png")}
                            resizeMode='cover'
                            />

                            <Text style={styles.logoText}>Whatsapp</Text>
                        </TouchableOpacity>  

                        <TouchableOpacity style={styles.logoHolder} onPress={()=>(handleTapIcon('Instagram'))}>
                            <Image
                            style={styles.logo} 
                            source={require("../../../assets/instagram.png")}
                            resizeMode='cover'
                            />

                            <Text style={styles.logoText}>Instagram</Text>
                        </TouchableOpacity>  

                        <TouchableOpacity style={styles.logoHolder} onPress={()=>(handleTapIcon('Lazada'))}>
                            <Image
                            style={styles.logo} 
                            source={require("../../../assets/lazada.png")}
                            resizeMode='cover'
                            />

                            <Text style={styles.logoText}>Lazada</Text>
                        </TouchableOpacity>  

                        <View style={{width:Constant.DEVICE_WIDTH*0.15 + 20, height: Constant.DEVICE_WIDTH*0.15}}/>
                    </View>

                    {/* cancel button */}
                    <TouchableOpacity style={styles.cancelButton} onPress={()=>{setModalVisible(false)}}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    screen :{
        flex:1,
        paddingTop: Constant.STATUSBAR,
        backgroundColor:'white'
    },
    header:{
        // backgroundColor:"green",
        height:50,
        paddingHorizontal:16,
        justifyContent:'center'
    },
    searchContainer:{
        flexDirection:'row',
        alignItems:'center'
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
    logoContainer:{
        flexDirection:'row',
        flexWrap :'wrap',
        justifyContent:'space-between',
    },
    logoHolder:{
        justifyContent:'center',
        marginVertical:10,
        marginHorizontal:5
    },
    logo:{
        height: Constant.DEVICE_WIDTH*0.15,
        width: Constant.DEVICE_WIDTH*0.15,
        margin: 5,
    },
    logoText:{
        textAlign:'center',
        fontSize: 10,
        color: Constant.TERTIARY_GREY_COLOR
    },
    cancelButton:{
        // backgroundColor:'yellow',
        paddingVertical:20,
        justifyContent:'center',
        borderTopColor: '#f0f0f0',
        borderTopWidth : 1,
        marginTop:15
    },
    cancelText:{
        textAlign:'center',
        color:Constant.PRIMARY_COLOR,
    }
});

export default Transaction;
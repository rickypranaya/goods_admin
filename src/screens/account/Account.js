import React, { useEffect , useRef, useState} from 'react';
import {Animated, View, Text, StyleSheet, Image, FlatList, Alert, TouchableOpacity } from 'react-native';

//components
import Constant from '../../components/Constants'

//import library
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { CommonActions } from '@react-navigation/native';


const Account = props=>{
    //navigation
    // const navigation = useNavigation();

    //data
    const [data, setData] = useState([])
    const [id, setId] = useState(0)
    const [name, setName] = useState('')
    const [role, setRole] = useState('')
    const [isModalVisible, setModalVisible]= useState(false)
    const [logoutModal, setLogoutModal]= useState(false)

    useEffect(() => { 
        LoadUsers()
    }, []);

    // loading user from local storage
    const LoadUsers = async ()=>{
         AsyncStorage.getItem("USER").then(value => {
            var user = JSON.parse(value)
            setRole(user.role)
            setName(user.firstname+' '+user.lastname)
            setId(user.id)
            fetchData(user.id)
            
        }).catch((error)=> console.log(error))

        
    }

    // to fetch users data
     const fetchData = async (id)=>{
        const URL = Constant.BASE_URL+"/user_get";

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
                    console.log('no user found')
                } else {
                    var data = responseData.data 
                    var itemList =[]
                    data.map ((item)=>{
                        if(item.id != id) itemList=[...itemList,item]
                    }) 
                    setData(itemList)
                }
            }
        }catch(error){
            Alert.alert('Tidak ada Koneksi Internet');
        }
    }

    //to render item
    const RenderItem = ({item})=>{
        return (
            <View style={styles.itemList}>
                <Text>{item.firstname + ' '+ item.lastname}</Text>
                <Text style={{color : Constant.TERTIARY_GREY_COLOR, paddingTop:5}}>{item.role}</Text>
            </View>
        )
    }

    const logOut = ()=>{
        setLogoutModal(true)
    }

    const onLogOut = async ()=>{
        await AsyncStorage.setItem('LOGGEDIN', 'false')
        await AsyncStorage.setItem('ROLE', '')

        props.navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                { name: 'login' }
                ],
            })
        );
    }

    return( 
        <View style={styles.screen}>
            <View style={styles.mainArea}>
                <View style={styles.header}>
                    <Text>Akun</Text>

                    <View style={styles.logOut}>
                        <TouchableOpacity onPress={logOut} style={{ flex:1, justifyContent:'center', paddingHorizontal:16}}>
                        <Text style={{color: Constant.PRIMARY_COLOR}}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* top part */}
                <View style={styles.logoContainer}>
                    <Image
                        style={styles.logo} 
                        source={require("../../../assets/icon.png")}
                        resizeMode='contain'
                    />

                    <View>
                        <Text style={{fontSize:14}}>{name}</Text>
                            <Text style={{color:Constant.TERTIARY_GREY_COLOR}}>{role}</Text>
                    </View>
                </View>
                    
                {/* bottom part */}
                <View style={styles.bottom}>
                    <Text style={{fontWeight:'bold', paddingBottom:10}}>Pengguna Lain</Text>
                    <FlatList
                        data={data}
                        renderItem={(item)=> <RenderItem {...item}/>}
                        keyExtractor={item => item.id.toString()}
                    />
                </View>
            </View>

            {/* logout modal */}
            {logoutModal &&
            <View style={{position:'absolute',elevation:2, backgroundColor:'rgba(52, 52, 52, 0.8)', height:'100%', width:'100%',justifyContent:'center', alignItems:'center'}}>
                <View style={{backgroundColor:'white',  paddingVertical:10, borderRadius:15}}>
                    <Text style={{paddingTop:20, paddingBottom:10, paddingHorizontal:16,fontWeight:'bold', fontSize:16}}>Log out dari Goods Admin?</Text>
                    
                    <TouchableOpacity onPress={onLogOut} style={{ justifyContent:'center', paddingVertical:12, marginTop:20, borderTopColor:'#f0f0f0', borderTopWidth:1}}>
                        <Text style={{textAlign:'center', color: Constant.PRIMARY_COLOR}}>Log Out</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={()=>{setLogoutModal(false)}} style={{ justifyContent:'center', paddingVertical:12, borderTopColor:'#f0f0f0', borderTopWidth:1}}>
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
        backgroundColor: 'white'
    },
    mainArea:{
        flex:1, 
        width:'100%', 
        paddingTop:Constant.STATUSBAR
    },
    header:{
        justifyContent:'center',
        flexDirection:'row',
        alignItems:'center',
        height:50,
        borderBottomColor : '#f0f0f0',
        borderBottomWidth:1
    },
    logOut:{
        position:'absolute',
        width:'100%',
        alignItems:'flex-end',
        textAlign:'right',
        height:'100%',
        justifyContent:'center',
    },
    top : {
        paddingHorizontal:16,
        paddingVertical:20,
        backgroundColor:'white',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        elevation:1,
        shadowOpacity:0.1, 
        shadowRadius:5, 
        shadowOffset:{width:0, height:2},
    },
    bottom:{
        paddingHorizontal:16,
        paddingVertical:20,
        flex:1
    },
    itemList:{
        paddingVertical:10,
        borderBottomColor: "#f0f0f0",
        borderBottomWidth:1
    },
    logo:{
        width:70,
        height:70,
        borderRadius:5000,
        marginHorizontal:10
    },
    logoContainer:{
        elevation:1,
        borderRadius:5000,
        backgroundColor:'white',
        borderRadius: 50,
        shadowOpacity:0.1, 
        shadowRadius:5, 
        shadowOffset:{width:0, height:2},
        flexDirection:"row",
        alignItems:'center',
        marginHorizontal:16,
        marginTop:20
    }
});

export default Account;
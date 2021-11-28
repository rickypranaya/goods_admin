import React, {useState} from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CommonActions } from '@react-navigation/native';

// Components
import MainButton from '../components/MainButton';
import Constant from '../components/Constants';
import TextField from '../components/TextField';

//import library
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppLoading from 'expo-app-loading';

const Login = props=>{
    const [userName, setUser] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const onloginPress =  ()=>{
        if (userName == ''){
            Alert.alert('Masukan username anda')
        } else if (password.length <= 5){
            Alert.alert('Masukan Password anda')
        } else {
            login()
        }
    }

    const login = async ()=>{
        setLoading(true)
        const URL = Constant.BASE_URL+"/login";

        try{
            const response = await fetch(URL, {
                method: "POST",
                body: JSON.stringify({
                    username : userName,
                    password : password,
                   }),
                headers:{
                    'Accept': 'application/json',
                    "Content-Type" : "application/json"
                }
            });

            if(response.status !=200){
                setLoading(false)
                throw new Error("something is wrong!");

            } else {
                const responseData = await response.json();
                if (responseData.status != 200){
                 setLoading(false)
                    Alert.alert('Username atau Password yang anda masukkan salah.')
                } else {

                    console.log('login success')
                    await props.setUserRole(responseData.data.role)
                    await AsyncStorage.setItem('LOGGEDIN', 'true')
                    await AsyncStorage.setItem('USER', JSON.stringify(responseData.data))
                    await AsyncStorage.setItem('FIRSTNAME', responseData.data.firstname)
                    await AsyncStorage.setItem('FULLNAME', responseData.data.firstname + ' ' + responseData.data.lastname)
                    await AsyncStorage.setItem('ROLE', responseData.data.role)
                    

                    setLoading(false)
                    props.navigation.dispatch(
                    CommonActions.reset({
                        index: 1,
                        routes: [
                        { name: 'Tabs' }
                        ],
                    })
                    );
                }
            }
        }catch(error){
            setLoading(false)
            Alert.alert('Tidak ada Koneksi Internet');
        }
    }

    // ========= check whether app is ready ========== 
    const [ready, setReady] = useState(false)
    const [showLogin, setShowLogin] = useState (false)

    // loading user from local storage
    const LoadUsers = async ()=>{
       await AsyncStorage.getItem("ROLE").then(value => {
        props.setUserRole(value)
        }).catch((error)=> console.log(error))

        AsyncStorage.getItem("LOGGEDIN").then(value => {
        if(value === 'true'){
            props.navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                { name: 'Tabs' }
                ],
            })
            );
        } else {
            setShowLogin(true);
        }
        }).catch((error)=> console.log(error))

        
    }

    if (!ready){
        return(
        <AppLoading
            startAsync={LoadUsers}
            onFinish={()=> setReady(true)}
            onError={console.warn}
        />
        )
    }

    return(
        <>
            {showLogin&&
            <KeyboardAvoidingView behavior={Platform.OS === 'ios'? 'padding' : null} style={styles.screen}>
                
                <Image
                    style={styles.logo} 
                    source={require("../../assets/icon.png")}
                    resizeMode='cover'
                />

                <View style={styles.textField}>
                    <TextField onChanged = {(val)=>{setUser(val)}} placeholder="Username"/>
                    <TextField onChanged = {(val)=>{setPassword(val)}} placeholder="Password" password="true"/>
                </View>

                <MainButton title='Log in' onPress={onloginPress}/>

                <TouchableOpacity onPress={()=>{Alert.alert('Contact Steviani for assistance')}}>
                    <Text style={styles.forgot}> Forgot password?</Text>
                </TouchableOpacity>

                
            </KeyboardAvoidingView>
            }

            {/* loading indicator */}
            { loading &&
            <View style={styles.loading}>
                <View style={{backgroundColor:'white', borderRadius:10, padding:20}}>
                    <ActivityIndicator size="small" color={Constant.PRIMARY_COLOR}/>
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
        alignItems:'center',
        justifyContent:'center',
        paddingHorizontal:Constant.DEVICE_WIDTH*0.15,
    },
    forgot:{
        color: Constant.PRIMARY_COLOR,
        fontSize: Constant.TERTIARY_FONT_SIZE,
        paddingVertical:10,
    },
    logo:{
        width: Constant.DEVICE_WIDTH*0.7,
        height:Constant.DEVICE_WIDTH*0.3
    },
    textField: {
        marginVertical:40, 
        width:'100%'
    },
    loading: {
        backgroundColor:'rgba(52, 52, 52, 0.8)', 
        position: 'absolute', 
        width:'100%', 
        height:'100%', 
        justifyContent:'center', 
        alignItems:'center'
    }
});

export default Login;
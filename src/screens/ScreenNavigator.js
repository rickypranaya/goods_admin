import * as React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

//import library
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {Icon} from 'react-native-elements';

//components
import Constant from '../components/Constants';

//import screens
import Account from './account/Account';
import Expense from './expense/Expense';
import Product from './product/Product';
import Transaction from './transaction/Transaction';
import Report from './report/Report';
import ManageTransaction from './transaction/ManageTransaction';
import Login from './Login'
import { BackgroundImage } from 'react-native-elements/dist/config';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function ScreenNavigator() {
    const [userRole, setUserRole] = React.useState('')

    const Tabs =()=>{
        return(
            <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                let type;
                let iconSize;

                if (route.name === 'Transaksi') {
                    if (iconName = focused){
                        iconName = 'tag'
                        type = 'material-community'
                        iconSize = 22
                    } else {
                        iconName = 'tag-outline'
                        type = 'material-community'
                        iconSize = 22
                    }
                } else if (route.name === 'Pengeluaran') {
                    if (iconName = focused){
                        iconName = 'card'
                        type = 'ionicon'
                        iconSize = 24
                    } else {
                        iconName = 'card-outline'
                        type = 'ionicon'
                        iconSize = 24
                    }
                } else  if (route.name === 'Produk') {
                    if (iconName = focused){
                        iconName = 'list-circle'
                        type = 'ionicon'
                        iconSize = 26
                    } else {
                        iconName = 'list-circle-outline'
                        type = 'ionicon'
                        iconSize = 26
                    }
                } else if (route.name === 'Laporan') {
                    if (iconName = focused){
                        iconName = 'bar-chart'
                        type = 'ionicon'
                        iconSize = 20
                    } else {
                        iconName = 'bar-chart-outline'
                        type = 'ionicon'
                        iconSize = 20
                    }
                } else  {
                    if (iconName = focused){
                        iconName = 'person-circle'
                        type = 'ionicon'
                        iconSize = 26
                    } else {
                        iconName = 'person-circle-outline'
                        type = 'ionicon'
                        iconSize =26
                    }
                }
                return (
                    <Icon
                    name={iconName}
                    type={type}
                    color={color}
                    size={iconSize}
                    />);
                },
            })}

            tabBarOptions={{
            
                activeTintColor: Constant.PRIMARY_COLOR,
                inactiveTintColor: '#676767',
                style:{ paddingBottom:10, paddingTop:6, height:58}
            }}
            >
                <Tab.Screen name="Transaksi" component={Transaction}/>
                <Tab.Screen name="Pengeluaran" component={Expense} />
                {userRole != 'Admin'&&
                <Tab.Screen name="Produk" component={Product} />
                }
                
                {userRole != 'Admin'&&
                <Tab.Screen name="Laporan" component={Report} />
                }
                <Tab.Screen name="Akun" component={Account} />
            </Tab.Navigator>
        )
    }

  return (
    <NavigationContainer>
       <Stack.Navigator >
       
        <Stack.Screen name="login" options={{ headerShown: false }} >
            {(props) => (
                <Login setUserRole ={setUserRole} {...props}/>
            )}
        </Stack.Screen>

        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }}/>
        <Stack.Screen name="manageTransaction" component={ManageTransaction} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
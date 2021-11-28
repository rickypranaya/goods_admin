import React from 'react';
import { View,StyleSheet, TouchableHighlight, TouchableOpacity, Text } from 'react-native';
import Constant from './Constants.js';
import { SwipeListView } from 'react-native-swipe-list-view';

const ListExpense = ({data, onPressItem, onDelete}) =>{

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

    const listItem = ({item}) => {
        return (
        <TouchableHighlight underlayColor='#f5f5f5' activeOpacity={1} style={styles.listContainer} onPress={()=>{onPressItem(item)}}>
            <View>
            <View style={styles.listContainerTop}>
                <Text style={{color:Constant.TERTIARY_GREY_COLOR }}>{item.date}</Text>
                <Text style={styles.expenseText}>- {formatRupiah(item.amount)}</Text>
            </View>

            <Text  style={{paddingVertical:5}}>{item.description}</Text>
            </View>
        </TouchableHighlight>
        )
    }

    const RenderHiddenItem = ({item})=>{
        return(
            <View style={{backgroundColor:'#FF2D35', flex:1, alignItems:'flex-end'}}>
                <TouchableOpacity  onPress={()=>{onDelete(item.item.id)}} style={styles.deleteButton}>

                    <Text style={styles.hiddenText}>Delete</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <SwipeListView 
            initialNumToRender={10}
            data={data}
            renderItem={({ item }) => 
            {
                return (listItem({item}))
            }
            }
            renderHiddenItem={(item)=> <RenderHiddenItem item={item}/> }
            rightOpenValue={-75}
            keyExtractor={item => item.id.toString()}
            disableRightSwipe={true}
        /> 
    );
}

const styles = StyleSheet.create({
    listContainerBottom:{
        flexDirection:'row',
    },
    listContainerTop:{
        flexDirection:'row',
        justifyContent:'space-between'
    },
    listLeft:{
        flex:1
    },
    listRight:{
        alignItems:'center',
        paddingLeft:10,
    },
    expenseText:{
        color: '#FF8383'
    },
    boldText:{
        fontWeight:'bold'
    },
    listContainer:{
        paddingHorizontal:16,
        backgroundColor:'white',
        paddingVertical:7,
        borderBottomWidth:1,
        borderBottomColor: "#f0f0f0",
    },
    hiddenText:{
        color:'white'
    },
    deleteButton:{
        backgroundColor:'#FF2D35',
        width:75,
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
});

export default ListExpense;
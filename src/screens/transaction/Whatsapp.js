import React, { useEffect, useState } from 'react';
import MainContent from './MainContent'
import { useIsFocused } from "@react-navigation/native"; 

const Whatsapp = props=>{

    const[updated, setUpdated] = useState(null)

    // to update when screen is focused
    const isFocused = useIsFocused();

    // update data on inserted transaksi
    useEffect(() => {   
        if (isFocused){
            props.setMarketplace('Whatsapp')
        }     
    }, [isFocused]);

    // update data on inserted transaksi
    useEffect(() => {        
        if (props.route.params?.date) {
            setUpdated(props.route.params.date)
            props.updateData()
        }
    }, [props.route.params?.date]);

    const onPressItem = (item) =>{
        props.navigation.navigate(
        {
            name: 'manageTransaction', 
            params: {
                marketplace: 'Whatsapp',
                item_id : item.id
            }
        })
    }

    return(
        <MainContent marketplace={'Whatsapp'} update={updated} searchFocus={props.searchFocus} searchList={props.searchList} searchReady={props.searchReady} onPress={onPressItem}/>
    );
}
export default Whatsapp;
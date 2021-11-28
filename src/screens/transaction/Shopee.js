import React, { useEffect, useState } from 'react';
import MainContent from './MainContent'
import { useIsFocused } from "@react-navigation/native"; 

const Shopee = props=>{

    const[updated, setUpdated] = useState(null)

    // to update when screen is focused
    const isFocused = useIsFocused();

    // update data on inserted transaksi
    useEffect(() => {   
        if (isFocused){
            props.setMarketplace('Shopee')
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
                marketplace: 'Shopee',
                item_id : item.id
            }
        })
    }

    return(
        <MainContent marketplace={'Shopee'} update={updated} searchFocus={props.searchFocus} searchList={props.searchList} searchReady={props.searchReady} onPress={onPressItem}/>
    );
}
export default Shopee;
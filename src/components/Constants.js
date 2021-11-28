import { Dimensions , StatusBar, Platform} from 'react-native';

class Constant {
    static STATUSBAR = Platform.OS === 'ios'? 44 :  StatusBar.currentHeight;
    static DEVICE_WIDTH = Dimensions.get('window').width;
    static DEVICE_HEIGHT = Dimensions.get('window').height;
    static PRIMARY_COLOR = '#10A3AB';
    static LIGHT_GREY = '#CECECE';
    static GREY_BACKGROUND = '#F6F6F6';
    static GREY_PLACEHOLDER = "#CECECE";
    static MAIN_FONT_SIZE = 17;
    static SECONDARY_FONT_SIZE = 15;
    static TERTIARY_FONT_SIZE = 13;
    static TERTIARY_GREY_COLOR = '#999999';
    static PADDING_HORIZONTAL = 20; 

    static BASE_URL = 'https://goodspharmacy.herokuapp.com/api';
}

export default Constant;

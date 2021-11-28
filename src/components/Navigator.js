import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer} from "react-navigation";

//import screens
import Login from "../screens/Login";
import ScreenNavigator from "../screens/ScreenNavigator";

const Navigator = 
  createStackNavigator({
      login:Login,
      screenNavigator: ScreenNavigator
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: true,
    },
    defaultNavigationOptions: () => ({
      cardStyle: {
          backgroundColor: "white",
      },
  }),
  });

export default createAppContainer(Navigator);